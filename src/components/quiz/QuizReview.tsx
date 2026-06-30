"use client";

import { cn } from "@/lib/utils/cn";
import type { Dictionary } from "@/lib/i18n/dictionary";

export interface ReviewItem {
  question: string;
  options: [string, string, string, string];
  chosenIndex: number | null;
  correctIndex: number;
  explanation: string;
}

export function QuizReview({
  items,
  t,
}: {
  items: ReviewItem[];
  t: Dictionary;
}) {
  return (
    <div className="max-h-[34rem] space-y-4 overflow-y-auto rounded-card border border-gold/20 bg-white/70 p-4 sm:p-5">
      {items.map((item, idx) => {
        const skipped = item.chosenIndex === null;
        const correct = item.chosenIndex === item.correctIndex;
        const chosenText =
          item.chosenIndex === null ? t.quiz.skipped : item.options[item.chosenIndex];
        const correctText = item.options[item.correctIndex];

        return (
          <article
            key={`${item.question}-${idx}`}
            className="rounded-xl border border-gold/20 bg-parchment/50 p-4"
          >
            <p className="text-xs font-semibold uppercase text-saffron">
              {t.quiz.question} {idx + 1}
            </p>
            <h3 className="mt-1 font-serif text-lg font-semibold text-maroon">
              {item.question}
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AnswerBox
                label={t.quiz.yourChoice}
                text={chosenText}
                tone={skipped ? "skipped" : correct ? "correct" : "wrong"}
              />
              <AnswerBox
                label={t.quiz.correctAnswer}
                text={correctText}
                tone="correct"
              />
            </div>

            <p className="mt-3 text-sm text-ink-soft">{item.explanation}</p>
          </article>
        );
      })}
    </div>
  );
}

function AnswerBox({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: "correct" | "wrong" | "skipped";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        tone === "correct" && "border-leaf/40 bg-leaf/10 text-leaf",
        tone === "wrong" && "border-red-300 bg-red-50 text-red-700",
        tone === "skipped" && "border-gold/30 bg-white text-ink-muted",
      )}
    >
      <p className="text-xs font-semibold uppercase opacity-80">{label}</p>
      <p className="mt-1 font-medium">{text}</p>
    </div>
  );
}
