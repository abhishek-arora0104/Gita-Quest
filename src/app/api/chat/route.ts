import { NextResponse } from "next/server";
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: copy.missingKey }, { status: 503 });
  }

  const answer = await generateGeminiAnswer({
    apiKey,
    locale,
    message,
    history,
  });

  const user = await getCurrentUser().catch(() => null);
  await saveChatTurn({
    userId: user?.id,
    locale,
    message,
    answer,
  });

  return NextResponse.json({ answer, sources: [], provider: "gemini" });
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
        contents: [
          {
            role: "user",
            parts: [{ text: buildUserPrompt({ message, history }) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1400,
          temperature: 0.45,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Gemini chatbot request failed", {
      status: response.status,
      detail: detail.slice(0, 500),
    });
    throw new Error(copy.serviceIssue);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error(copy.serviceIssue);
  }

  return appendDisclaimer(text, locale);
}

function systemPrompt(locale: Locale): string {
  const language =
    locale === "hi"
      ? "Hindi in Devanagari"
      : locale === "hinglish"
        ? "natural Hinglish in Roman script"
        : "clear English";

  return [
    "You are the Gita Quest tutor, a helpful Bhagavad Gita learning assistant.",
    `Answer in ${language}.`,
    "Use your Gemini knowledge directly. Do not use or mention a local knowledge base.",
    "Give useful, detailed answers. Prefer 4-8 short paragraphs, or structured bullets when the user asks for a list.",
    "For summaries, explain the setting, main teaching, important themes, and practical meaning.",
    "For verse requests, you may summarize all verses in a chapter, but do not reproduce long copyrighted translations in full.",
    "Do not mention or link Vedabase.",
    "Do not invent exact verse quotations. If unsure about exact wording, summarize instead.",
    "Do not reveal quiz answer keys before a user has attempted a quiz.",
    "End with a brief practical takeaway when it fits the question.",
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

function appendDisclaimer(text: string, locale: Locale): string {
  const disclaimer = localizedCopy(locale).disclaimer;
  return text.includes(disclaimer) ? text : `${text}\n\n${disclaimer}`;
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

function localizedCopy(locale: Locale) {
  if (locale === "hi") {
    return {
      empty: "कृपया अपना प्रश्न लिखें।",
      tooLong: "कृपया प्रश्न थोड़ा छोटा रखें।",
      disabled: "Chatbot अभी बंद है।",
      missingKey: "Gemini API key सेट नहीं है।",
      serviceIssue: "Gemini से उत्तर नहीं मिल पाया। कृपया थोड़ी देर बाद फिर कोशिश करें।",
      disclaimer: "अध्ययन सहायता के लिए, आध्यात्मिक अधिकार नहीं।",
    };
  }
  if (locale === "hinglish") {
    return {
      empty: "Kripya apna sawaal likhein.",
      tooLong: "Kripya sawaal thoda chhota rakhein.",
      disabled: "Chatbot abhi band hai.",
      missingKey: "Gemini API key set nahi hai.",
      serviceIssue: "Gemini se answer nahi mil paya. Kripya thodi der baad try karein.",
      disclaimer: "Study support ke liye, spiritual authority nahi.",
    };
  }
  return {
    empty: "Please enter a question.",
    tooLong: "Please keep the question a little shorter.",
    disabled: "The chatbot is currently disabled.",
    missingKey: "Gemini API key is not configured.",
    serviceIssue: "Gemini could not answer right now. Please try again shortly.",
    disclaimer: "For study support, not spiritual authority.",
  };
}
