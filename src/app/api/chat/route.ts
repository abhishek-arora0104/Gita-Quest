import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  defaultChatContexts,
  isLikelyGitaQuestion,
  retrieveChatContexts,
  type ChatContext,
  type ChatSource,
} from "@/lib/chatbot/retrieval";

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

const MAX_MESSAGE_LENGTH = 900;
const MAX_HISTORY = 8;
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

type ChatProvider = "openai" | "gemini" | "fallback";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequest | null;
  const message = body?.message?.trim() ?? "";
  const locale = isLocale(body?.locale) ? body.locale : "en";
  const history = sanitizeHistory(body?.history);

  if (!message) {
    return NextResponse.json(
      { error: localizedCopy(locale).empty },
      { status: 400 },
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: localizedCopy(locale).tooLong },
      { status: 400 },
    );
  }

  const user = await getCurrentUser().catch(() => null);
  const contexts = retrieveChatContexts({ query: message, locale });
  const hasLocalContext = contexts.length > 0;
  const selectedContexts = hasLocalContext ? contexts : defaultChatContexts(locale);
  const sources = hasLocalContext
    ? uniqueSources(selectedContexts.flatMap((ctx) => ctx.sources))
    : [];
  const copy = localizedCopy(locale);
  const provider = resolveChatProvider();
  const allowGeneralFallback = process.env.CHATBOT_ALLOW_GENERAL_FALLBACK !== "false";

  if (
    provider === "fallback" &&
    !allowGeneralFallback &&
    !isLikelyGitaQuestion(message) &&
    !hasLocalContext
  ) {
    const answer = copy.offTopic;
    await saveChatTurn({ userId: user?.id, locale, message, answer, sources });
    return NextResponse.json({ answer, sources, provider });
  }

  if (provider === "fallback") {
    const answer = fallbackAnswer({ locale, contexts: selectedContexts });
    await saveChatTurn({ userId: user?.id, locale, message, answer, sources });
    return NextResponse.json({ answer, sources, fallback: true, provider });
  }

  const answer =
    provider === "gemini"
      ? await generateGeminiAnswer({
          apiKey: process.env.GEMINI_API_KEY ?? "",
          locale,
          message,
          history,
          contexts: hasLocalContext ? selectedContexts : [],
          allowGeneralKnowledge: allowGeneralFallback,
        })
      : await generateOpenAIAnswer({
          apiKey: process.env.OPENAI_API_KEY ?? "",
          locale,
          message,
          history,
          contexts: hasLocalContext ? selectedContexts : [],
          allowGeneralKnowledge: allowGeneralFallback,
        });

  await saveChatTurn({ userId: user?.id, locale, message, answer, sources });
  return NextResponse.json({ answer, sources, provider });
}

async function generateGeminiAnswer({
  apiKey,
  locale,
  message,
  history,
  contexts,
  allowGeneralKnowledge,
}: {
  apiKey: string;
  locale: Locale;
  message: string;
  history: ChatMessage[];
  contexts: ChatContext[];
  allowGeneralKnowledge: boolean;
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
          parts: [
            {
              text: systemPrompt(locale, {
                hasLocalContext: contexts.length > 0,
                allowGeneralKnowledge,
              }),
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildUserPrompt({ message, history, contexts }) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 650,
          temperature: 0.35,
        },
      }),
    },
  );

  if (!response.ok) {
    return fallbackAnswer({
      locale,
      contexts: contexts.length > 0 ? contexts : defaultChatContexts(locale),
      prefix: copy.serviceIssue,
    });
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

  return text && text.length > 0
    ? appendDisclaimer(text, locale)
    : fallbackAnswer({
        locale,
        contexts: contexts.length > 0 ? contexts : defaultChatContexts(locale),
      });
}

async function generateOpenAIAnswer({
  apiKey,
  locale,
  message,
  history,
  contexts,
  allowGeneralKnowledge,
}: {
  apiKey: string;
  locale: Locale;
  message: string;
  history: ChatMessage[];
  contexts: ChatContext[];
  allowGeneralKnowledge: boolean;
}) {
  const copy = localizedCopy(locale);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CHAT_MODEL ?? DEFAULT_OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: systemPrompt(locale, {
                hasLocalContext: contexts.length > 0,
                allowGeneralKnowledge,
              }),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildUserPrompt({ message, history, contexts }),
            },
          ],
        },
      ],
      max_output_tokens: 650,
      temperature: 0.35,
    }),
  });

  if (!response.ok) {
    return fallbackAnswer({
      locale,
      contexts: contexts.length > 0 ? contexts : defaultChatContexts(locale),
      prefix: copy.serviceIssue,
    });
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ text?: string; type?: string }>;
    }>;
  };

  const text =
    data.output_text ??
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((item) => item.text)
      .filter(Boolean)
      .join("\n")
      .trim();

  return text && text.length > 0
    ? appendDisclaimer(text, locale)
    : fallbackAnswer({
        locale,
        contexts: contexts.length > 0 ? contexts : defaultChatContexts(locale),
      });
}

function systemPrompt(
  locale: Locale,
  {
    hasLocalContext,
    allowGeneralKnowledge,
  }: { hasLocalContext: boolean; allowGeneralKnowledge: boolean },
): string {
  const language =
    locale === "hi"
      ? "Hindi in Devanagari"
      : locale === "hinglish"
        ? "natural Hinglish in Roman script"
        : "simple English";

  return [
    "You are the Gita Quest tutor, a beginner-friendly Bhagavad Gita study assistant.",
    `Reply in ${language}.`,
    hasLocalContext
      ? allowGeneralKnowledge
        ? "Use the provided Gita Quest context first. If it is incomplete, continue with your general knowledge so the user gets a useful complete answer."
        : "Use only the provided Gita Quest context for factual claims."
      : allowGeneralKnowledge
        ? "No matching Gita Quest context was found. Use your general knowledge to answer the user well."
        : "Use only the provided Gita Quest context for factual claims.",
    "Do not quote long scripture passages. Do not invent verse numbers or Sanskrit quotes.",
    allowGeneralKnowledge
      ? "If the question is unrelated to the Bhagavad Gita, answer briefly and invite the user back to Gita study."
      : "If the question is unrelated to the Bhagavad Gita, politely redirect to Gita learning.",
    allowGeneralKnowledge
      ? "Do not stop with 'I am not sure' only because the provided context is short. Use general knowledge to fill gaps, while keeping the answer practical and grounded."
      : "If the context is insufficient, say you are not sure and suggest the closest chapter link.",
    "Keep answers short: 2-4 paragraphs or up to 5 bullets.",
    "Do not mention or link Vedabase.",
    "Do not reveal quiz answer keys before a user has attempted a quiz.",
  ].join("\n");
}

function buildUserPrompt({
  message,
  history,
  contexts,
}: {
  message: string;
  history: ChatMessage[];
  contexts: ChatContext[];
}) {
  return [
    contexts.length > 0
      ? "Relevant Gita Quest context:"
      : "Relevant Gita Quest context: none found for this question.",
    contexts.map((ctx) => ctx.excerpt).join("\n\n---\n\n"),
    history.length > 0
      ? `Recent conversation:\n${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}`
      : "Recent conversation: none",
    `User question: ${message}`,
  ].join("\n\n");
}

function resolveChatProvider(): ChatProvider {
  if (process.env.CHATBOT_ENABLED === "false") return "fallback";

  const requested = process.env.CHATBOT_PROVIDER?.toLowerCase();
  if (requested === "gemini") {
    return process.env.GEMINI_API_KEY ? "gemini" : "fallback";
  }
  if (requested === "openai") {
    return process.env.OPENAI_API_KEY ? "openai" : "fallback";
  }
  if (requested === "fallback") {
    return "fallback";
  }

  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "fallback";
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

function fallbackAnswer({
  locale,
  contexts,
  prefix,
}: {
  locale: Locale;
  contexts: ChatContext[];
  prefix?: string;
}): string {
  const copy = localizedCopy(locale);
  const top = contexts[0];
  const base =
    locale === "hi"
      ? `${top.chapterTitle} से शुरू करें। इस अध्याय में मुख्य बात यह है कि Gita हमें भ्रम, कर्तव्य और सही दृष्टि को समझने में मदद करती है।`
      : locale === "hinglish"
        ? `${top.chapterTitle} se shuru karein. Is chapter ka main point hai ki Gita humein confusion, duty aur sahi drishti samajhne mein madad karti hai.`
        : `Start with ${top.chapterTitle}. The key idea is that the Gita helps us understand confusion, duty, and a steadier way to act.`;

  return appendDisclaimer([prefix, base, copy.deeper].filter(Boolean).join("\n\n"), locale);
}

function appendDisclaimer(text: string, locale: Locale): string {
  const disclaimer = localizedCopy(locale).disclaimer;
  return text.includes(disclaimer) ? text : `${text}\n\n${disclaimer}`;
}

function uniqueSources(sources: ChatSource[]): ChatSource[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.href)) return false;
    seen.add(source.href);
    return true;
  });
}

async function saveChatTurn({
  userId,
  locale,
  message,
  answer,
  sources,
}: {
  userId?: string;
  locale: Locale;
  message: string;
  answer: string;
  sources: ChatSource[];
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
        sources,
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
      offTopic:
        "मैं Gita Quest का अध्ययन सहायक हूँ। कृपया Bhagavad Gita, किसी अध्याय, ध्यान, कर्म, धर्म, या जीवन में लागू करने से जुड़ा प्रश्न पूछें।",
      serviceIssue:
        "AI सेवा अभी उपलब्ध नहीं है, इसलिए मैं उपलब्ध Gita Quest सामग्री से छोटा उत्तर दे रहा हूँ।",
      deeper: "अधिक गहराई से पढ़ने के लिए नीचे दिए गए Gita Quest chapter लिंक देखें।",
      disclaimer: "अध्ययन सहायता के लिए, आध्यात्मिक अधिकार नहीं।",
    };
  }
  if (locale === "hinglish") {
    return {
      empty: "Kripya apna sawaal likhein.",
      tooLong: "Kripya sawaal thoda chhota rakhein.",
      offTopic:
        "Main Gita Quest ka study helper hoon. Kripya Bhagavad Gita, kisi chapter, dhyan, karma, dharma, ya daily life application par sawaal poochhein.",
      serviceIssue:
        "AI service abhi available nahi hai, isliye main Gita Quest content se chhota answer de raha hoon.",
      deeper: "Aur gehra padhne ke liye neeche Gita Quest chapter links dekhein.",
      disclaimer: "Study support ke liye, spiritual authority nahi.",
    };
  }
  return {
    empty: "Please enter a question.",
    tooLong: "Please keep the question a little shorter.",
    offTopic:
      "I’m the Gita Quest study helper. Please ask about the Bhagavad Gita, a chapter, meditation, karma, dharma, or applying the teachings in daily life.",
    serviceIssue:
      "The AI service is unavailable right now, so I’m giving a short answer from the available Gita Quest content.",
    deeper: "For deeper reading, use the Gita Quest chapter links below.",
    disclaimer: "For study support, not spiritual authority.",
  };
}
