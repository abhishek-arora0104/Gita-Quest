import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterBySlugForLocale, writtenChapterSlugs } from "@/lib/content";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { getCurrentUser } from "@/lib/auth/session";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export function generateStaticParams() {
  return writtenChapterSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const chapter = getChapterBySlugForLocale(slug, locale);
  if (!chapter) return {};
  const t = getDictionary(locale);
  return {
    title: `${t.quiz.titlePrefix}: ${chapter.title}`,
    description: locale === "hi"
      ? `अध्याय ${chapter.number}: ${chapter.title} की समझ जांचें — 25 प्रश्न।`
      : `Test your understanding of Chapter ${chapter.number}: ${chapter.title} with 25 questions.`,
    robots: { index: false },
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const chapter = getChapterBySlugForLocale(slug, locale);
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
          href={`/${locale}/chapters/${chapter.slug}`}
          className="hover:text-saffron"
        >
          ← {t.quiz.backTo} {chapter.title}
        </Link>
      </nav>

      <header className="text-center">
        <p className="font-serif text-sm font-semibold uppercase tracking-wide text-saffron">
          {t.common.chapterWord} {chapter.number} · {t.quiz.titlePrefix}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-maroon sm:text-4xl">
          {chapter.title}
        </h1>
        <p className="mt-2 text-ink-soft">
          {chapter.quiz.length} {t.quiz.questions} · {t.quiz.instantFeedback}
        </p>
      </header>

      {!user ? (
        <div className="mt-8 rounded-card border border-gold/30 bg-parchment/60 p-6 text-center">
          <p className="text-ink-soft">
            {t.quiz.guestPrefix}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-saffron hover:underline"
            >
              {t.nav.login}
            </Link>{" "}
            {t.quiz.guestSuffix}
          </p>
        </div>
      ) : null}

      <div className="mt-8">
        <QuizEngine
          chapterNumber={chapter.number}
          chapterSlug={chapter.slug}
          questions={questionsForClient}
          answerKey={chapter.quiz.map((q) => ({
            id: q.id,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }))}
          authenticated={Boolean(user)}
          t={t}
          locale={locale}
        />
      </div>
    </div>
  );
}
