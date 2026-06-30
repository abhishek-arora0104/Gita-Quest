import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterBySlugForLocale, writtenChapterSlugs } from "@/lib/content";
import { FlashcardDeck } from "@/components/quiz/FlashcardDeck";
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
    title: `${t.quiz.flashcardsTitle}: ${chapter.title}`,
    description: t.quiz.flashcardsBody,
    robots: { index: false },
  };
}

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const chapter = getChapterBySlugForLocale(slug, locale);
  if (!chapter) notFound();

  const cards = [
    ...chapter.keyTakeaways.map((text, i) => ({
      front: `${t.chapter.takeaways} #${i + 1}`,
      back: text,
    })),
    ...chapter.keyLessons.map((text, i) => ({
      front: `${t.chapter.takeaways} #${chapter.keyTakeaways.length + i + 1}`,
      back: text,
    })),
    ...chapter.reflectionQuestions.map((text, i) => ({
      front: `${t.chapter.reflection} #${i + 1}`,
      back: text,
    })),
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted">
        <Link
          href={`/${locale}/chapters/${slug}`}
          className="hover:text-saffron"
        >
          ← {chapter.title}
        </Link>
      </nav>

      <header className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon sm:text-4xl">
          {t.quiz.flashcardsTitle}
        </h1>
        <p className="mt-2 text-ink-soft">{t.quiz.flashcardsBody}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {cards.length} {t.quiz.flashcards}
        </p>
      </header>

      <div className="mt-8">
        <FlashcardDeck cards={cards} t={t} />
      </div>
    </div>
  );
}
