import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterBySlug, writtenChapterSlugs } from "@/lib/content";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { getCurrentUser } from "@/lib/auth/session";

export function generateStaticParams() {
  return writtenChapterSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return {};
  return {
    title: `Quiz: ${chapter.title}`,
    description: `Test your understanding of Chapter ${chapter.number}: ${chapter.title} with 25 questions.`,
    robots: { index: false }, // quizzes shouldn't be indexed
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();

  const user = await getCurrentUser();

  // Pass only the data needed by the client (no answer leakage via SEO).
  const questionsForClient = chapter.quiz.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted">
        <Link
          href={`/chapters/${chapter.slug}`}
          className="hover:text-saffron"
        >
          ← Back to {chapter.title}
        </Link>
      </nav>

      <header className="text-center">
        <p className="font-serif text-sm font-semibold uppercase tracking-wide text-saffron">
          Chapter {chapter.number} · Quiz
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-maroon sm:text-4xl">
          {chapter.title}
        </h1>
        <p className="mt-2 text-ink-soft">
          {chapter.quiz.length} questions · instant feedback after each answer
        </p>
      </header>

      {!user ? (
        <div className="mt-8 rounded-card border border-gold/30 bg-parchment/60 p-6 text-center">
          <p className="text-ink-soft">
            You can take this quiz to practice, but you&apos;ll need to{" "}
            <Link
              href="/auth/login"
              className="font-medium text-saffron hover:underline"
            >
              log in
            </Link>{" "}
            to save your score, earn XP, and unlock badges.
          </p>
        </div>
      ) : null}

      <div className="mt-8">
        <QuizEngine
          chapterNumber={chapter.number}
          chapterSlug={chapter.slug}
          questions={questionsForClient}
          // Correct answers + explanations are passed for client-side scoring.
          // This is fine for an educational quiz; the server action re-scores
          // against the source of truth to prevent tampering.
          answerKey={chapter.quiz.map((q) => ({
            id: q.id,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }))}
          authenticated={Boolean(user)}
        />
      </div>
    </div>
  );
}
