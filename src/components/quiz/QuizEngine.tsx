"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { completeQuiz, type QuizResult } from "@/actions/completeQuiz";
import { QuizResults } from "./QuizResults";
import { cn } from "@/lib/utils/cn";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { QuizSetup } from "./QuizModePicker";
import type { ReviewItem } from "./QuizReview";

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

const ALL_DIFFICULTIES: QuestionForClient["difficulty"][] = [];

export function QuizEngine({
  chapterNumber,
  chapterSlug,
  questions,
  answerKey,
  authenticated,
  t,
  locale,
  setup,
}: {
  chapterNumber: number;
  chapterSlug: string;
  questions: QuestionForClient[];
  answerKey: AnswerKeyEntry[];
  authenticated: boolean;
  t: Dictionary;
  locale: Locale;
  setup?: QuizSetup;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => questions.map(() => null),
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(60, questions.length * 12));
  const [, startTransition] = useTransition();
  const startedAt = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const setupDifficulties = setup?.difficulties ?? ALL_DIFFICULTIES;

  const questionIndexes = useMemo(() => {
    if (!setupDifficulties.length) {
      return questions.map((_, idx) => idx);
    }
    const selectedDifficulties = new Set(setupDifficulties);
    return questions
      .map((q, idx) => (selectedDifficulties.has(q.difficulty) ? idx : -1))
      .filter((idx) => idx >= 0);
  }, [questions, setupDifficulties]);

  const displayedQuestions = questionIndexes.map((idx) => questions[idx]);
  const displayedAnswerKey = questionIndexes.map((idx) => answerKey[idx]);
  const fullQuestionIndex = questionIndexes[current] ?? 0;
  const q = displayedQuestions[current] ?? questions[0];
  const key = displayedAnswerKey[current] ?? answerKey[0];
  const totalQuestions = displayedQuestions.length;
  const isTimed = setup?.mode === "timed";
  const filteredLabel = setup?.difficulties.length
    ? setup.difficulties.map((d) => diffLabel(t, d)).join(", ")
    : null;
  const isCorrect = revealed && selected === key.correctIndex;

  const buildReviewData = useCallback(
    (finalAnswers: (number | null)[]): ReviewItem[] =>
      questionIndexes.map((i) => {
        const question = questions[i];
        return {
          question: question.question,
          options: question.options,
          chosenIndex: finalAnswers[i] ?? null,
          correctIndex: answerKey[i].correctIndex,
          explanation: answerKey[i].explanation,
        };
      }),
    [answerKey, questionIndexes, questions],
  );

  const answersWithCurrentSelection = useCallback(
    (sourceAnswers: (number | null)[] = answers) => {
      if (revealed || selected === null || fullQuestionIndex === undefined) {
        return sourceAnswers;
      }
      const next = [...sourceAnswers];
      next[fullQuestionIndex] = selected;
      return next;
    },
    [answers, fullQuestionIndex, revealed, selected],
  );

  const submit = useCallback(
    async (sourceAnswers: (number | null)[] = answers) => {
      if (submittedRef.current) return;
      const finalAnswers = answersWithCurrentSelection(sourceAnswers);
      submittedRef.current = true;
      setSubmitting(true);
      setSubmitError(null);
      setReviewData(buildReviewData(finalAnswers));

      const durationMs = Date.now() - (startedAt.current ?? Date.now());
      startTransition(async () => {
        if (authenticated) {
          const clientDate = new Date().toISOString().slice(0, 10);
          const res = await completeQuiz(chapterNumber, finalAnswers, locale, clientDate, {
            mode: setup?.mode ?? "standard",
            durationMs: isTimed ? durationMs : undefined,
            questionIndexes,
          });
          if (!res.ok) {
            submittedRef.current = false;
            setSubmitError(res.error ?? "Something went wrong.");
            setSubmitting(false);
            return;
          }
          setResult(res);
          setSubmitting(false);
        } else {
          const correct = questionIndexes.reduce(
            (sum, i) =>
              sum + (finalAnswers[i] === answerKey[i].correctIndex ? 1 : 0),
            0,
          );
          const perfect = correct === questionIndexes.length;
          setResult({
            ok: true,
            score: correct,
            total: questionIndexes.length,
            points: correct * 10 + (perfect ? 50 : 0) + 25,
            perfect,
            xpEarned: 0,
            leveledUp: false,
            newBadges: [],
            streak: 0,
            mode: setup?.mode ?? "standard",
            durationMs: isTimed ? durationMs : undefined,
          });
          setSubmitting(false);
        }
      });
    },
    [
      answerKey,
      answers,
      answersWithCurrentSelection,
      authenticated,
      buildReviewData,
      chapterNumber,
      isTimed,
      locale,
      questionIndexes,
      setup?.mode,
      startTransition,
    ],
  );

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isTimed || result || submittedRef.current) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void submit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTimed, result, submit]);

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleCheck() {
    if (selected === null) return;
    setRevealed(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[fullQuestionIndex] = selected;
      return next;
    });
  }

  function handleNext() {
    if (current < totalQuestions - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      void submit();
    }
  }

  // ── Results screen ──
  if (result && result.ok) {
    return (
      <QuizResults
        result={result}
        chapterNumber={chapterNumber}
        chapterSlug={chapterSlug}
        authenticated={authenticated}
        t={t}
        locale={locale}
        reviewData={reviewData}
      />
    );
  }

  if (!q || !key || totalQuestions === 0) {
    return (
      <div className="rounded-card border border-gold/30 bg-parchment/60 p-6 text-center text-sm text-ink-soft">
        {t.common.notQuite}
      </div>
    );
  }

  // ── Question screen ──
  return (
    <div>
      {/* Header: progress + score tracker */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-ink-soft">
            {t.quiz.question} {current + 1} {t.quiz.of} {totalQuestions}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {filteredLabel && (
              <Badge variant="muted">
                {t.quiz.filtered}: {filteredLabel}
              </Badge>
            )}
            {isTimed && (
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  timeLeft < 10
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gold/30 bg-parchment text-ink-soft",
                )}
              >
                {t.quiz.timer}: {formatTime(timeLeft)}
              </span>
            )}
            <Badge variant={difficultyTone[q.difficulty]}>
              {q.difficulty}
            </Badge>
          </div>
        </div>
        <ProgressBar
          value={current + (revealed ? 1 : 0)}
          max={totalQuestions}
          label={t.quiz.progress}
        />
        <LiveScore answers={answers} answerKey={answerKey} t={t} />
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
                    {t.quiz.correctBadge}
                  </span>
                )}
                {revealed && isThis && !isAnswer && (
                  <span className="ml-auto text-sm font-semibold text-red-600">
                    {t.quiz.yourAnswer}
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
              {isCorrect ? t.quiz.correct : t.common.notQuite}
            </p>
            <p className="mt-1 text-ink-soft">{key.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-ink-muted">
          {!revealed && selected === null && t.quiz.select}
          {!revealed && selected !== null && t.quiz.check}
        </div>
        <div className="flex gap-3">
          {!revealed ? (
            <Button onClick={handleCheck} disabled={selected === null}>
              {t.quiz.checkAnswer}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={submitting}
              variant={current === totalQuestions - 1 ? "secondary" : "primary"}
            >
              {submitting
                ? t.quiz.calculating
                : current === totalQuestions - 1
                  ? t.quiz.seeResults
                  : t.quiz.nextQuestion}
            </Button>
          )}
        </div>
      </div>

      {submitError && (
        <p className="mt-4 text-sm text-red-600">{submitError}</p>
      )}

      <p className="mt-8 text-center text-xs text-ink-muted">
        <Link href={`/${locale}/chapters/${chapterSlug}`} className="hover:text-saffron">
          {t.quiz.exit}
        </Link>
      </p>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function diffLabel(t: Dictionary, d: QuestionForClient["difficulty"]): string {
  switch (d) {
    case "easy":
      return t.quiz.diffEasy;
    case "medium":
      return t.quiz.diffMedium;
    case "hard":
      return t.quiz.diffHard;
  }
}

/** Live score tracker shown while taking the quiz. */
function LiveScore({
  answers,
  answerKey,
  t,
}: {
  answers: (number | null)[];
  answerKey: AnswerKeyEntry[];
  t: Dictionary;
}) {
  const correct = answers.reduce<number>(
    (s, a, i) => s + ((a ?? null) === answerKey[i].correctIndex ? 1 : 0),
    0,
  );
  const answered = answers.filter((a) => a !== null).length;
  if (answered === 0) return null;
  return (
    <p className="mt-2 text-xs font-medium text-ink-muted">
      {t.quiz.scoreSoFar}: {correct}/{answered} {t.dashboard.correct}
    </p>
  );
}
