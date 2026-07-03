import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  message?: string;
  locale?: Locale;
  history?: ChatMessage[];
};

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY = 8;
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_GEMINI_OUTPUT_TOKENS = 4096;
const MAX_CONTINUATIONS = 2;
const FREE_DAILY_LIMIT = 3;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequest | null;
  const message = body?.message?.trim() ?? "";
  const locale = isLocale(body?.locale) ? body.locale : "en";
  const history = sanitizeHistory(body?.history);
  const copy = localizedCopy(locale);

  if (!message) {
    return NextResponse.json({ error: copy.empty }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: copy.tooLong }, { status: 400 });
  }

  if (process.env.CHATBOT_ENABLED === "false") {
    return NextResponse.json({ error: copy.disabled }, { status: 503 });
  }

  // ── Determine API key: prefer user's key, fall back to app key ──
  const user = await getCurrentUser().catch(() => null);
  const userApiKey = user ? await fetchUserGeminiKey(user.id) : null;
  const hasOwnKey = !!userApiKey;

  // ── Track daily usage via cookies + DB fallback ──
  const today = new Date().toISOString().slice(0, 10);
  const cookieStore = await cookies();
  const usageCookie = cookieStore.get("gita_daily_chat")?.value;

  let currentUsed = 0;
  if (usageCookie) {
    const [cookieDate, cookieCount] = usageCookie.split(":");
    if (cookieDate === today) {
      currentUsed = parseInt(cookieCount, 10) || 0;
    }
  }

  if (user) {
    const dbCount = await countUserPromptsToday(user.id, today);
    currentUsed = Math.max(currentUsed, dbCount);
  }

  // ── Rate limit: enforce only when using the shared app key ──
  if (!hasOwnKey && currentUsed >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: copy.dailyLimit,
        dailyLimitReached: true,
        promptCount: currentUsed,
        dailyLimit: FREE_DAILY_LIMIT,
      },
      { status: 429 },
    );
  }

  const apiKey = hasOwnKey
    ? userApiKey!
    : process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: copy.missingKey }, { status: 503 });
  }

  let answer: string;
  try {
    answer = await generateGeminiAnswer({
      apiKey,
      locale,
      message,
      history,
    });
  } catch (error) {
    console.error("Gemini chatbot request failed", error);
    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json({ 
        error: copy.dailyLimit, 
        globalLimitReached: true 
      }, { status: 429 });
    }
    return NextResponse.json({ error: copy.serviceIssue }, { status: 502 });
  }

  await saveChatTurn({
    userId: user?.id,
    locale,
    message,
    answer,
  });

  // ── Update usage cookie and compute remaining ──
  const newUsed = currentUsed + 1;
  if (!hasOwnKey) {
    cookieStore.set("gita_daily_chat", `${today}:${newUsed}`, {
      path: "/",
      maxAge: 86400 * 2,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  const remaining = hasOwnKey ? -1 : Math.max(FREE_DAILY_LIMIT - newUsed, 0);

  return NextResponse.json({
    answer,
    sources: [],
    provider: "gemini",
    hasOwnKey,
    remaining,
  });
}

async function generateGeminiAnswer({
  apiKey,
  locale,
  message,
  history,
}: {
  apiKey: string;
  locale: Locale;
  message: string;
  history: ChatMessage[];
}) {
  const copy = localizedCopy(locale);
  const model = process.env.GEMINI_CHAT_MODEL ?? DEFAULT_GEMINI_MODEL;
  const maxOutputTokens = getGeminiMaxOutputTokens();
  const initialPrompt = buildUserPrompt({ message, history });
  const contents: GeminiContent[] = [
    {
      role: "user",
      parts: [{ text: initialPrompt }],
    },
  ];
  const chunks: string[] = [];

  for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt += 1) {
    const data = await requestGemini({
      apiKey,
      model,
      locale,
      contents,
      maxOutputTokens,
    });

    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      throw new Error(copy.serviceIssue);
    }

    chunks.push(text);

    if (candidate?.finishReason !== "MAX_TOKENS") {
      break;
    }

    contents.push({
      role: "model",
      parts: [{ text }],
    });
    contents.push({
      role: "user",
      parts: [
        {
          text: "Continue exactly from where you stopped. Do not restart or repeat earlier sections. Finish the answer naturally.",
        },
      ],
    });
  }

  return chunks.join("\n\n");
}

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

async function requestGemini({
  apiKey,
  model,
  locale,
  contents,
  maxOutputTokens,
}: {
  apiKey: string;
  model: string;
  locale: Locale;
  contents: GeminiContent[];
  maxOutputTokens: number;
}): Promise<GeminiResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt(locale) }],
        },
        contents,
        generationConfig: {
          maxOutputTokens,
          temperature: 0.45,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Gemini API error ${response.status}: ${detail.slice(0, 500)}`,
    );
  }

  return (await response.json()) as GeminiResponse;
}

function getGeminiMaxOutputTokens(): number {
  const configured = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS);
  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_GEMINI_OUTPUT_TOKENS;
  }
  return Math.min(Math.max(Math.floor(configured), 1024), 8192);
}

function systemPrompt(locale: Locale): string {
  const language =
    locale === "hi"
      ? "Hindi in Devanagari"
      : locale === "hinglish"
        ? "natural Hinglish in Roman script"
        : "clear English";

  return [
    "You are the Gita Quest tutor, a warm and friendly Bhagavad Gita learning assistant.",
    `Answer in ${language}.`,
    "Use your Gemini knowledge directly. Do not use or mention a local knowledge base.",
    "Tone: Write in a friendly, conversational tone as if you are talking to a 12-year-old. Use simple words, short sentences, relatable examples, and an encouraging style. Avoid heavy jargon, complex grammar, or dense paragraphs.",
    "Structure: Keep answers easy to skim. Use short paragraphs (2-3 sentences each), and use bullet points or numbered lists when listing ideas. Break long explanations into small digestible chunks.",
    "For summaries, explain the setting, main teaching, important themes, and practical meaning in a story-like way that a young student would enjoy.",
    "For verse requests, you may summarize all verses in a chapter, but do not reproduce long copyrighted translations in full.",
    "Do not mention or link Vedabase.",
    "Do not invent exact verse quotations. If unsure about exact wording, summarize instead.",
    "If you quote or mention a specific Bhagavad Gita verse, you MUST include the original Sanskrit sloka in Devanagari, followed by its Roman transliteration (IAST format), and then its translation.",
    "Do not reveal quiz answer keys before a user has attempted a quiz.",
    "End with a brief, practical takeaway that a kid can apply in their daily life — like a small challenge, a thought to try, or a fun tip.",
    "Do NOT always end your response with a question. Only ask a question if it is highly relevant and encourages meaningful reflection.",
  ].join("\n");
}

function buildUserPrompt({
  message,
  history,
}: {
  message: string;
  history: ChatMessage[];
}) {
  return [
    history.length > 0
      ? `Recent conversation:\n${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}`
      : "Recent conversation: none",
    `User question: ${message}`,
  ].join("\n\n");
}

function sanitizeHistory(history: ChatRequest["history"]): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (msg): msg is ChatMessage =>
        (msg?.role === "user" || msg?.role === "assistant") &&
        typeof msg.content === "string",
    )
    .slice(-MAX_HISTORY)
    .map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, MAX_MESSAGE_LENGTH),
    }));
}

async function saveChatTurn({
  userId,
  locale,
  message,
  answer,
}: {
  userId?: string;
  locale: Locale;
  message: string;
  answer: string;
}) {
  if (!userId) return;
  try {
    const supabase = await createClient();
    await supabase.from("user_chat_messages").insert([
      {
        user_id: userId,
        locale,
        role: "user",
        content: message,
        sources: [],
      },
      {
        user_id: userId,
        locale,
        role: "assistant",
        content: answer,
        sources: [],
      },
    ]);
  } catch {
    // Chat history is optional. A missing migration should not break answers.
  }
}

async function fetchUserGeminiKey(userId: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("gemini_api_key")
      .eq("id", userId)
      .single();
    return data?.gemini_api_key ?? null;
  } catch {
    return null;
  }
}

async function countUserPromptsToday(
  userId: string,
  todayStart: string,
): Promise<number> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("user_chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "user")
      .gte("created_at", `${todayStart}T00:00:00+00:00`);
    return count ?? 0;
  } catch {
    return 0;
  }
}

function localizedCopy(locale: Locale) {
  if (locale === "hi") {
    return {
      empty: "कृपया अपना प्रश्न लिखें।",
      tooLong: "कृपया प्रश्न थोड़ा छोटा रखें।",
      disabled: "Chatbot अभी बंद है।",
      missingKey: "Gemini API key सेट नहीं है।",
      serviceIssue: "Gemini से उत्तर नहीं मिल पाया। कृपया थोड़ी देर बाद फिर कोशिश करें।",
      dailyLimit:
        "आज की 3 मुफ्त पूछताछ खत्म हो गईं। ज़्यादा पूछने के लिए अपनी Gemini API key Settings में जोड़ें।",
    };
  }
  if (locale === "hinglish") {
    return {
      empty: "Kripya apna sawaal likhein.",
      tooLong: "Kripya sawaal thoda chhota rakhein.",
      disabled: "Chatbot abhi band hai.",
      missingKey: "Gemini API key set nahi hai.",
      serviceIssue: "Gemini se answer nahi mil paya. Kripya thodi der baad try karein.",
      dailyLimit:
        "Aaj ki 3 free questions khatam ho gayi. Zyada poochhne ke liye apni Gemini API key Settings mein add karein.",
    };
  }
  return {
    empty: "Please enter a question.",
    tooLong: "Please keep the question a little shorter.",
    disabled: "The chatbot is currently disabled.",
    missingKey: "Gemini API key is not configured.",
    serviceIssue: "Gemini could not answer right now. Please try again shortly.",
    dailyLimit:
      "You've used all 3 free questions for today. To ask more, add your own Gemini API key in Settings.",
  };
}
