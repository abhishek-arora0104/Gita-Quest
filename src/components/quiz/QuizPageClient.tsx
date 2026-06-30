"use client";

import { useState } from "react";
import { QuizEngine } from "./QuizEngine";
import { QuizModePicker, type QuizSetup } from "./QuizModePicker";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

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

export function QuizPageClient({
  chapterNumber,
  chapterSlug,
  questions,
  answerKey,
  authenticated,
  t,
  locale,
}: {
  chapterNumber: number;
  chapterSlug: string;
  questions: QuestionForClient[];
  answerKey: AnswerKeyEntry[];
  authenticated: boolean;
  t: Dictionary;
  locale: Locale;
}) {
  const [setup, setSetup] = useState<QuizSetup | null>(null);

  if (!setup) {
    return (
      <QuizModePicker
        t={t}
        questionCount={questions.length}
        onStart={setSetup}
      />
    );
  }

  return (
    <QuizEngine
      chapterNumber={chapterNumber}
      chapterSlug={chapterSlug}
      questions={questions}
      answerKey={answerKey}
      authenticated={authenticated}
      t={t}
      locale={locale}
      setup={setup}
    />
  );
}
