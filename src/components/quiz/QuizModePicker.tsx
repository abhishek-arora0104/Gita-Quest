"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Difficulty } from "@/lib/content/schema";
import type { QuizMode } from "@/actions/completeQuiz";

export interface QuizSetup {
  mode: QuizMode;
  /** Difficulties to include. Empty = all. */
  difficulties: Difficulty[];
}

export function QuizModePicker({
  t,
  questionCount,
  onStart,
  onCancel,
}: {
  t: Dictionary;
  /** Total questions available (full set). */
  questionCount: number;
  onStart: (setup: QuizSetup) => void;
  /** Optional: rendered as a "back" affordance. */
  onCancel?: () => void;
}) {
  const [mode, setMode] = useState<QuizMode>("standard");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);

  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  // Standard = ~24s/question; timed = ~12s/question, in whole minutes.
  const budgetMinutes = Math.max(1, Math.round((questionCount * 12) / 60));

  return (
    <div className="mx-auto max-w-xl">
      <header className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon sm:text-4xl">
          {t.quiz.setupTitle}
        </h1>
        <p className="mt-2 text-ink-soft">{t.quiz.setupSubtitle}</p>
      </header>

      {/* Mode */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-saffron">
          {t.quiz.titlePrefix}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            active={mode === "standard"}
            title={t.quiz.modeStandard}
            body={t.quiz.modeStandardBody}
            onClick={() => setMode("standard")}
          />
          <ModeCard
            active={mode === "timed"}
            title={t.quiz.modeTimed}
            body={`${t.quiz.modeTimedBody} · ${budgetMinutes} ${t.quiz.timedBudget}`}
            onClick={() => setMode("timed")}
          />
        </div>
      </section>

      {/* Difficulty */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-saffron">
          {t.quiz.difficulty}
        </h2>
        <div className="flex flex-wrap gap-2">
          <DifficultyChip
            active={difficulties.length === 0}
            label={t.quiz.diffAll}
            onClick={() => setDifficulties([])}
          />
          {(["easy", "medium", "hard"] as const).map((d) => (
            <DifficultyChip
              key={d}
              active={difficulties.includes(d)}
              label={diffLabel(t, d)}
              onClick={() => toggleDifficulty(d)}
            />
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-10 flex items-center justify-center gap-3">
        {onCancel && (
          <Button variant="outline" size="lg" onClick={onCancel}>
            {t.quiz.backTo}
          </Button>
        )}
        <Button
          size="lg"
          onClick={() => onStart({ mode, difficulties })}
        >
          {t.quiz.startQuiz}
        </Button>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  title,
  body,
  onClick,
}: {
  active: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-card border-2 p-5 text-left transition-colors",
        active
          ? "border-saffron bg-saffron/10"
          : "border-gold/20 bg-white/70 hover:border-saffron/50",
      )}
    >
      <p className="font-serif text-lg font-semibold text-maroon">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </button>
  );
}

function DifficultyChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-saffron bg-saffron text-white"
          : "border-gold/30 bg-white text-ink-soft hover:border-saffron/50",
      )}
    >
      {label}
    </button>
  );
}

function diffLabel(t: Dictionary, d: Difficulty): string {
  switch (d) {
    case "easy":
      return t.quiz.diffEasy;
    case "medium":
      return t.quiz.diffMedium;
    case "hard":
      return t.quiz.diffHard;
  }
}
