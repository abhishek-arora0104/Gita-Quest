"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { completeQuiz, type QuizResult } from "@/actions/completeQuiz";
import { QuizResults } from "./QuizResults";
import { cn } from "@/lib/utils/cn";

type QuestionForClient = {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: [string, string, string, string];
};

type AnswerKeyEntry = {
  id: string;
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

const difficultyTone = {
  easy: "leaf",
  medium: "gold",
  hard: "saffron",
} as const;

export function QuizEngine({
  chapterNumber,
  chapterSlug,
  questions,
  answerKey,
  authenticated,
}: {
  chapterNumber: number;
  chapterSlug: string;
  questions: QuestionForClient[];
  answerKey: AnswerKeyEntry[];
  authenticated: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  // answers[i] = option chosen for question i (null until answered)
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => questions.map(() => null),
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const q = questions[current];
  const key = answerKey[current];
  const isCorrect = revealed && selected === key.correctIndex;

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleCheck() {
    if (selected === null) return;
    setRevealed(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = selected;
      return next;
    });
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      // Last question → submit.
      void submit();
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    startTransition(async () => {
      if (authenticated) {
        const res = await completeQuiz(chapterNumber, answers);
        if (!res.ok) {
          setSubmitError(res.error ?? "Something went wrong.");
          setSubmitting(false);
          return;
        }
        setResult(res);
        setSubmitting(false);
      } else {
        // Guest: score locally only.
        const correct = questions.reduce(
          (s, _q, i) =>
            s + (answers[i] === answerKey[i].correctIndex ? 1 : 0),
          0,
        );
        setResult({
          ok: true,
          score: correct,
          total: questions.length,
          points: correct * 10 + 25,
          perfect: correct === questions.length,
          xpEarned: 0,
          leveledUp: false,
          newBadges: [],
          streak: 0,
        });
        setSubmitting(false);
      }
    });
  }

  // ── Results screen ──
  if (result && result.ok) {
    return (
      <QuizResults
        result={result}
        chapterSlug={chapterSlug}
        authenticated={authenticated}
      />
    );
  }

  // ── Question screen ──
  return (
    <div>
      {/* Header: progress + score tracker */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft">
            Question {current + 1} of {questions.length}
          </span>
          <Badge variant={difficultyTone[q.difficulty]}>
            {q.difficulty}
          </Badge>
        </div>
        <ProgressBar
          value={current + (revealed ? 1 : 0)}
          max={questions.length}
          label="Quiz progress"
        />
        <LiveScore answers={answers} answerKey={answerKey} />
      </div>

      {/* Question card */}
      <div className="rounded-card border border-gold/20 bg-white/80 p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-maroon sm:text-2xl">
          {q.question}
        </h2>

        <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer choices">
          {q.options.map((opt, idx) => {
            const isThis = selected === idx;
            const isAnswer = idx === key.correctIndex;
            let state: "idle" | "selected" | "correct" | "wrong" = "idle";
            if (revealed) {
              if (isAnswer) state = "correct";
              else if (isThis) state = "wrong";
            } else if (isThis) {
              state = "selected";
            }
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isThis}
                disabled={revealed}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                  state === "idle" &&
                    "border-gold/20 bg-white hover:border-saffron hover:bg-saffron/5",
                  state === "selected" &&
                    "border-saffron bg-saffron/10",
                  state === "correct" &&
                    "border-leaf bg-leaf/10 text-leaf",
                  state === "wrong" &&
                    "border-red-400 bg-red-50 text-red-700",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold",
                    state === "idle" && "border-gold/40 text-ink-muted",
                    state === "selected" &&
                      "border-saffron bg-saffron text-white",
                    state === "correct" && "border-leaf bg-leaf text-white",
                    state === "wrong" &&
                      "border-red-400 bg-red-400 text-white",
                  )}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-ink">{opt}</span>
                {revealed && isAnswer && (
                  <span className="ml-auto text-sm font-semibold text-leaf">
                    ✓ Correct
                  </span>
                )}
                {revealed && isThis && !isAnswer && (
                  <span className="ml-auto text-sm font-semibold text-red-600">
                    ✗ Your answer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation after answering */}
        {revealed && (
          <div
            className={cn(
              "mt-5 animate-fade-in rounded-xl border p-4 text-sm",
              isCorrect
                ? "border-leaf/40 bg-leaf/10 text-ink"
                : "border-gold/40 bg-parchment text-ink",
            )}
          >
            <p className="font-semibold text-maroon">
              {isCorrect ? "✓ Correct!" : "Not quite."}
            </p>
            <p className="mt-1 text-ink-soft">{key.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-ink-muted">
          {!revealed && selected === null && "Select an answer to continue."}
          {!revealed && selected !== null && "Check your answer →"}
        </div>
        <div className="flex gap-3">
          {!revealed ? (
            <Button onClick={handleCheck} disabled={selected === null}>
              Check answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={submitting}
              variant={current === questions.length - 1 ? "secondary" : "primary"}
            >
              {submitting
                ? "Calculating score…"
                : current === questions.length - 1
                  ? "See results →"
                  : "Next question →"}
            </Button>
          )}
        </div>
      </div>

      {submitError && (
        <p className="mt-4 text-sm text-red-600">{submitError}</p>
      )}

      <p className="mt-8 text-center text-xs text-ink-muted">
        <Link href={`/chapters/${chapterSlug}`} className="hover:text-saffron">
          Exit quiz
        </Link>
      </p>
    </div>
  );
}

/** Live score tracker shown while taking the quiz. */
function LiveScore({
  answers,
  answerKey,
}: {
  answers: (number | null)[];
  answerKey: AnswerKeyEntry[];
}) {
  const correct = answers.reduce<number>(
    (s, a, i) => s + ((a ?? null) === answerKey[i].correctIndex ? 1 : 0),
    0,
  );
  const answered = answers.filter((a) => a !== null).length;
  if (answered === 0) return null;
  return (
    <p className="mt-2 text-xs font-medium text-ink-muted">
      Score so far: {correct}/{answered} correct
    </p>
  );
}
