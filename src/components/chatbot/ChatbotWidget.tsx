"use client";

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
        }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? copy.error);
      }
      const answer = data.answer;

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
    <div className="fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label={copy.title}
          className="mb-3 flex h-[34rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-card border border-gold/30 bg-cream shadow-2xl shadow-maroon/20"
        >
          <header className="flex items-center justify-between border-b border-gold/20 bg-white/80 px-4 py-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-maroon">
                {copy.title}
              </h2>
              <p className="text-xs text-ink-muted">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
              aria-label={copy.close}
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-ink-soft shadow-sm">
                {copy.thinking}
              </div>
            )}
          </div>

          <div className="border-t border-gold/20 bg-white/80 p-3">
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={copy.placeholder}
                className="min-h-12 flex-1 resize-none rounded-2xl border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-saffron"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || input.trim().length === 0}
                className="h-12 rounded-full bg-saffron px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-dark disabled:pointer-events-none disabled:opacity-50"
              >
                {copy.send}
              </button>
            </div>
            <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-muted">
              {copy.disclaimer}
            </p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          window.setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex h-14 items-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-cream shadow-lg shadow-maroon/25 transition-transform hover:-translate-y-0.5 hover:bg-maroon-dark"
        aria-expanded={open}
      >
        <span aria-hidden="true">☸</span>
        {copy.button}
      </button>
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
      <div className="whitespace-pre-wrap">
        <FormattedMessage content={message.content} />
      </div>
    </article>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {formatInlineMarkdown(line)}
          {index < lines.length - 1 ? "\n" : null}
        </span>
      ))}
    </>
  );
}

function formatInlineMarkdown(text: string): ReactNode[] {
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
      button: "Gita सहायक",
      title: "Gita सहायक",
      subtitle: "Gemini से विस्तृत उत्तर",
      welcome:
        "हरे कृष्ण। Bhagavad Gita, किसी अध्याय, quiz, meditation, karma, या daily life application पर प्रश्न पूछें।",
      placeholder: "अपना प्रश्न लिखें...",
      send: "भेजें",
      thinking: "सोच रहा हूँ...",
      close: "चैट बंद करें",
      error: "अभी उत्तर नहीं मिल पाया। कृपया फिर कोशिश करें।",
      disclaimer: "अध्ययन सहायता के लिए, आध्यात्मिक अधिकार नहीं।",
    };
  }
  if (locale === "hinglish") {
    return {
      button: "Gita helper",
      title: "Gita helper",
      subtitle: "Gemini se detailed jawab",
      welcome:
        "Hare Krishna. Bhagavad Gita, kisi chapter, quiz, meditation, karma, ya daily life application par sawaal poochhein.",
      placeholder: "Apna sawaal likhein...",
      send: "Bhejein",
      thinking: "Soch raha hoon...",
      close: "Chat band karein",
      error: "Abhi answer nahi mil paya. Kripya phir try karein.",
      disclaimer: "Study support ke liye, spiritual authority nahi.",
    };
  }
  return {
    button: "Gita helper",
    title: "Gita helper",
    subtitle: "Detailed answers with Gemini",
    welcome:
      "Hare Krishna. Ask about a chapter, quiz idea, meditation, karma, dharma, or applying the Gita in daily life.",
    placeholder: "Ask a Gita question...",
    send: "Send",
    thinking: "Thinking...",
    close: "Close chat",
    error: "I could not answer right now. Please try again.",
    disclaimer: "For study support, not spiritual authority.",
  };
}
