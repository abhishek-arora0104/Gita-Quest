"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/config";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const MAX_HISTORY_FOR_API = 8;

export function ChatbotWidget({ locale }: { locale: Locale }) {
  const copy = getChatCopy(locale);
  const t = importChatbotT(locale);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: copy.welcome,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [globalLimitReached, setGlobalLimitReached] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [hasOwnKey, setHasOwnKey] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const apiHistory = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .slice(-MAX_HISTORY_FOR_API)
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          locale,
          history: apiHistory,
          clientDate: new Date().toISOString().slice(0, 10),
        }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
        dailyLimitReached?: boolean;
        globalLimitReached?: boolean;
        hasOwnKey?: boolean;
        remaining?: number;
      };

      if (!response.ok || !data.answer) {
        if (data.dailyLimitReached) {
          setDailyLimitReached(true);
          throw new Error(data.error ?? t.limitReached);
        }
        if (data.globalLimitReached) {
          setGlobalLimitReached(true);
          throw new Error(data.error ?? t.globalLimitReached);
        }
        throw new Error(data.error ?? copy.error);
      }
      const answer = data.answer;

      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
      }
      if (data.hasOwnKey) {
        setHasOwnKey(true);
        setDailyLimitReached(false);
        setGlobalLimitReached(false);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 flex flex-col items-end sm:bottom-6 sm:left-auto sm:right-6">
      {open && (
        <section
          aria-label={copy.title}
          className="flex h-[62vh] max-h-[26rem] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-gold/30 bg-cream shadow-2xl shadow-maroon/20 sm:h-[30rem] sm:max-h-[30rem] sm:w-80"
        >
          <header className="flex items-center justify-between border-b border-gold/20 bg-white/90 px-3.5 py-2.5">
            <div>
              <h2 className="font-serif text-base font-bold text-maroon">
                {copy.title}
              </h2>
              <p className="text-[11px] text-ink-muted">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-base font-bold text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
              aria-label={copy.close}
            >
              ✕
            </button>
          </header>

          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 text-xs sm:text-sm">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-xs text-ink-soft shadow-sm sm:text-sm">
                {copy.thinking}
              </div>
            )}
          </div>

          {/* ── Limit reached banners ── */}
          {(dailyLimitReached || globalLimitReached) && !hasOwnKey && (
            <div className="border-t border-gold/20 bg-amber-50 px-3 py-2 text-xs">
              <p className="font-medium text-maroon">
                {dailyLimitReached ? t.limitReached : t.globalLimitReached}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-soft">
                {dailyLimitReached ? t.limitBody : t.globalLimitBody}
              </p>
              <Link
                href={`/${locale}/settings`}
                className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-saffron px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-saffron-dark"
              >
                ⚙ {t.limitCta}
              </Link>
            </div>
          )}

          <div className="border-t border-gold/20 bg-white/90 p-2.5">
            {remaining !== null && remaining >= 0 && !hasOwnKey && (
              <p className="mb-1 text-[11px] text-ink-muted">
                {remaining}/3 {t.remaining}
              </p>
            )}
            {hasOwnKey && (
              <p className="mb-1 text-[11px] text-leaf">✓ {t.unlimited}</p>
            )}
            {error && <p className="mb-1.5 text-[11px] text-red-600">{error}</p>}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={copy.placeholder}
                className="min-h-10 flex-1 resize-none rounded-xl border border-gold/30 bg-white px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-saffron sm:text-sm"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || input.trim().length === 0}
                className="h-10 rounded-xl bg-saffron px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-saffron-dark disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
              >
                {copy.send}
              </button>
            </div>
          </div>
        </section>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex h-12 items-center gap-2 rounded-full bg-maroon px-4 text-xs font-semibold text-cream shadow-lg shadow-maroon/25 transition-transform hover:-translate-y-0.5 hover:bg-maroon-dark sm:h-14 sm:px-5 sm:text-sm"
          aria-expanded={false}
        >
          <span aria-hidden="true">☸</span>
          {copy.button}
        </button>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
        isUser
          ? "ml-auto rounded-br-sm bg-saffron text-white"
          : "rounded-bl-sm bg-white text-ink-soft",
      )}
    >
      <div>
        <FormattedMessage content={message.content} />
      </div>
    </article>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <>
      {blocks.map((block, index) => (
        <span key={`${index}-${block.type}`}>
          {renderBlock(block)}
        </span>
      ))}
    </>
  );
}

type MarkdownBlock =
  | { type: "hr" }
  | { type: "heading"; level: number; text: string }
  | { type: "bullet"; text: string }
  | { type: "numbered"; text: string; number: string }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.split("\n");
  const blocks: MarkdownBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Horizontal rule: --- or ***
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      continue;
    }

    // Headings: # Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    // Numbered list: 1. Item or 1) Item
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
    if (numberedMatch) {
      blocks.push({
        type: "numbered",
        number: numberedMatch[1],
        text: numberedMatch[2],
      });
      continue;
    }

    // Bullet list: - Item, * Item, • Item
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      blocks.push({ type: "bullet", text: bulletMatch[1] });
      continue;
    }

    // Empty lines become empty paragraphs (for spacing)
    if (trimmed === "") {
      blocks.push({ type: "paragraph", text: "" });
      continue;
    }

    // Regular paragraph
    blocks.push({ type: "paragraph", text: trimmed });
  }

  return blocks;
}

function renderBlock(block: MarkdownBlock): ReactNode {
  switch (block.type) {
    case "hr":
      return (
        <span className="block my-2 border-t border-gold/25" />
      );
    case "heading": {
      const sizeClass =
        block.level === 1
          ? "text-base font-bold text-ink mt-3 mb-1"
          : block.level === 2
            ? "text-[15px] font-semibold text-ink mt-2.5 mb-0.5"
            : "text-sm font-semibold text-ink mt-2 mb-0.5";
      return (
        <span className={cn("block", sizeClass)}>
          {formatInline(block.text)}
        </span>
      );
    }
    case "bullet":
      return (
        <span className="block ml-3 pl-2 border-l-2 border-saffron/30 py-0.5">
          <span className="text-saffron mr-1.5">•</span>
          {formatInline(block.text)}
        </span>
      );
    case "numbered":
      return (
        <span className="block ml-3 pl-2 py-0.5">
          <span className="text-saffron mr-1 font-semibold">
            {block.number}.
          </span>
          {formatInline(block.text)}
        </span>
      );
    case "paragraph":
      if (block.text === "") {
        return <span className="block h-2" />;
      }
      return <span className="block">{formatInline(block.text)}</span>;
  }
}

function formatInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token}`;
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function getChatCopy(locale: Locale) {
  if (locale === "hi") {
    return {
      button: "Gita Helper",
      title: "Gita Helper",
      subtitle: "Gemini से विस्तृत उत्तर",
      welcome:
        "हरे कृष्ण। Bhagavad Gita, किसी अध्याय, quiz, meditation, karma, या daily life application पर प्रश्न पूछें।",
      placeholder: "अपना प्रश्न लिखें...",
      send: "भेजें",
      thinking: "सोच रहा हूँ...",
      close: "चैट बंद करें",
      error: "अभी उत्तर नहीं मिल पाया। कृपया फिर कोशिश करें।",
    };
  }
  if (locale === "hinglish") {
    return {
      button: "Gita Helper",
      title: "Gita Helper",
      subtitle: "Gemini se detailed jawab",
      welcome:
        "Hare Krishna. Bhagavad Gita, kisi chapter, quiz, meditation, karma, ya daily life application par sawaal poochhein.",
      placeholder: "Apna sawaal likhein...",
      send: "Bhejein",
      thinking: "Soch raha hoon...",
      close: "Chat band karein",
      error: "Abhi answer nahi mil paya. Kripya phir try karein.",
    };
  }
  return {
    button: "Gita Helper",
    title: "Gita Helper",
    subtitle: "Your Guide To Life",
    welcome:
      "Hare Krishna. Ask about a chapter, quiz idea, meditation, karma, dharma, or applying the Gita in daily life.",
    placeholder: "Ask a Gita question...",
    send: "Send",
    thinking: "Thinking...",
    close: "Close chat",
    error: "I could not answer right now. Please try again.",
  };
}

type ChatbotT = {
  limitReached: string;
  limitBody: string;
  limitCta: string;
  remaining: string;
  unlimited: string;
  globalLimitReached: string;
  globalLimitBody: string;
};

function importChatbotT(locale: Locale): ChatbotT {
  const dict = {
    en: {
      limitReached: "You've used all 3 free questions for today.",
      limitBody: "To ask more questions, add your own Gemini API key. It's free to get one!",
      limitCta: "Go to Settings to add your API key",
      remaining: "free questions left today",
      unlimited: "Unlimited questions with your own API key",
      globalLimitReached: "The app's global API limit has been reached.",
      globalLimitBody: "Lots of people are asking questions! To skip the wait and continue right now, please add your own free Gemini API key.",
    },
    hi: {
      limitReached: "आज की 3 मुफ्त पूछताछ खत्म हो गईं।",
      limitBody: "ज़्यादा पूछने के लिए अपनी Gemini API key जोड़ें। यह मुफ्त है!",
      limitCta: "API key जोड़ने के लिए Settings पर जाएं",
      remaining: "आज की बची मुफ्त पूछताछ",
      unlimited: "अपनी API key से असीमित पूछताछ",
      globalLimitReached: "ऐप की ग्लोबल API लिमिट खत्म हो गई है।",
      globalLimitBody: "बहुत सारे लोग प्रश्न पूछ रहे हैं! अभी जारी रखने के लिए कृपया अपनी मुफ्त Gemini API key जोड़ें।",
    },
    hinglish: {
      limitReached: "Aaj ki 3 free questions khatam ho gayi.",
      limitBody: "Zyada poochhne ke liye apni Gemini API key add karein. Yeh free hai!",
      limitCta: "API key add karne ke liye Settings par jayein",
      remaining: "aaj ki baaki free questions",
      unlimited: "Apni API key se unlimited questions",
      globalLimitReached: "App ki global API limit khatam ho gayi hai.",
      globalLimitBody: "Bahut saare log questions poochh rahe hain! Abhi continue karne ke liye kripya apni free Gemini API key add karein.",
    },
  };
  return dict[locale];
}
