import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getChapterBySlugForLocale,
  getNextChapterForLocale,
  writtenChapterSlugs,
} from "@/lib/content";
import { ChapterContent } from "@/components/chapter/ChapterContent";
import { ReflectionForm } from "@/components/chapter/ReflectionForm";
import { ChapterActionsClient } from "@/components/chapter/ChapterActionsClient";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LOCALE_META, localeAlternates } from "@/lib/i18n/config";

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${siteUrl}/${locale}/chapters/${chapter.slug}`;

  return {
    title: chapter.seo.metaTitle,
    description: chapter.seo.metaDescription,
    keywords: chapter.seo.keywords,
    alternates: {
      canonical: `/${locale}/chapters/${chapter.slug}`,
      languages: localeAlternates(siteUrl, `/chapters/${slug}`),
    },
    openGraph: {
      type: "article",
      title: chapter.seo.metaTitle,
      description: chapter.seo.metaDescription,
      url,
      siteName: "Gita Quest",
      locale: LOCALE_META[locale].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: chapter.seo.metaTitle,
      description: chapter.seo.metaDescription,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const chapter = getChapterBySlugForLocale(slug, locale);
  if (!chapter) notFound();

  // Optional: signed-in users see their progress on this chapter.
  const user = await getCurrentUser();
  let progress: {
    summary_read: boolean;
    quiz_completed: boolean;
    best_score: number;
  } | null = null;

  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_chapter_progress")
      .select("summary_read, quiz_completed, best_score")
      .eq("user_id", user.id)
      .eq("chapter_number", chapter.number)
      .maybeSingle();
    progress = data;
  }

  const nextChapter = getNextChapterForLocale(chapter.number, locale);

  // JSON-LD structured data for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `Bhagavad Gita Chapter ${chapter.number}: ${chapter.title}`,
    description: chapter.seo.metaDescription,
    learningResourceType: "Article",
    educationalLevel: "Beginner",
    inLanguage: LOCALE_META[locale].htmlLang,
    isPartOf: {
      "@type": "Book",
      name: "Bhagavad Gita",
    },
    teaches: chapter.keyLessons,
    about: {
      "@type": "Thing",
      name: `${chapter.title} (${chapter.sanskritName})`,
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-sm text-ink-muted"
      >
        <Link href={`/${locale}/chapters`} className="hover:text-saffron">
          ← {t.chapter.allChapters}
        </Link>
      </nav>

      {/* Chapter header */}
      <header className="text-center">
        <p className="font-serif text-sm font-semibold uppercase tracking-wide text-saffron">
          {t.common.chapterWord} {chapter.number} · {chapter.sanskritName}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-maroon sm:text-5xl">
          {chapter.title}
        </h1>
        <p className="mt-3 text-lg italic text-ink-soft">{chapter.subtitle}</p>
        <p className="mt-3 text-sm text-ink-muted">
          ⏱ {chapter.readingTimeMins} {t.common.minRead} · ~{chapter.wordCount} {t.common.words}
        </p>
        {progress && (
          <p className="mt-3 text-sm font-medium text-leaf">
            {progress.quiz_completed
              ? `✓ ${t.chapter.quizCompleted} · ${t.chapter.bestScore} ${progress.best_score}/${chapter.quiz.length}`
              : progress.summary_read
                ? `✓ ${t.chapter.started}`
                : ""}
          </p>
        )}
      </header>

      <div className="divider-ornament mt-8" aria-hidden="true">
        <span>❖</span>
      </div>

      {/* Full summary */}
      <div className="mt-10">
        <ChapterContent chapter={chapter} t={t} />
      </div>

      {/* Reflection + actions */}
      <section className="mt-16 rounded-card border border-gold/20 bg-white/70 p-6 sm:p-8">
        <h3 className="font-serif text-2xl font-semibold text-maroon">
          {t.chapter.reflectQuiz}
        </h3>
        <p className="mt-2 text-ink-soft">
          {t.chapter.reflectQuizBody}
        </p>

        {user ? (
          <ReflectionForm
            chapterNumber={chapter.number}
            initialText={null}
            t={t}
          />
        ) : (
          <div className="mt-4 rounded-xl bg-parchment p-4 text-sm text-ink-soft">
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-saffron hover:underline"
            >
              {t.nav.login}
            </Link>{" "}
            {t.chapter.loginToSave}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            href={`/${locale}/chapters/${chapter.slug}/quiz`}
            className="min-h-12 whitespace-nowrap px-6 py-3 text-base sm:w-auto"
          >
            {progress?.quiz_completed ? t.chapter.retakeQuiz : t.chapter.startQuiz}
          </Button>
          {user && (
            <ChapterActionsClient
              chapterNumber={chapter.number}
              alreadyRead={progress?.summary_read ?? false}
              locale={locale}
            />
          )}
        </div>
      </section>

      {/* Next chapter */}
      {nextChapter && (
        <nav
          aria-label={t.common.nextChapter}
          className="mt-12 rounded-card bg-gradient-to-br from-maroon to-saffron p-6 text-center text-cream sm:p-8"
        >
          <p className="text-sm uppercase tracking-wide opacity-80">
            {t.common.nextChapter} · {t.common.chapterWord} {nextChapter.number}
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">
            {nextChapter.title}
          </p>
          <p className="mt-1 opacity-90">{nextChapter.subtitle}</p>
          <Link
            href={`/${locale}/chapters/${nextChapter.slug}`}
            className="mt-4 inline-block rounded-full bg-cream px-5 py-2 text-sm font-semibold text-maroon transition-transform hover:scale-105"
          >
            {t.chapter.continue}
          </Link>
        </nav>
      )}
    </div>
  );
}
