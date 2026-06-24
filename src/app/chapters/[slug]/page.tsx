import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getChapterBySlug,
  getNextChapter,
  writtenChapterSlugs,
} from "@/lib/content";
import { ChapterContent } from "@/components/chapter/ChapterContent";
import { ReflectionForm } from "@/components/chapter/ReflectionForm";
import { ChapterActionsClient } from "@/components/chapter/ChapterActionsClient";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${siteUrl}/chapters/${chapter.slug}`;

  return {
    title: chapter.seo.metaTitle,
    description: chapter.seo.metaDescription,
    keywords: chapter.seo.keywords,
    alternates: { canonical: `/chapters/${chapter.slug}` },
    openGraph: {
      type: "article",
      title: chapter.seo.metaTitle,
      description: chapter.seo.metaDescription,
      url,
      siteName: "Gita Quest",
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
  const chapter = getChapterBySlug(slug);
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

  const nextChapter = getNextChapter(chapter.number);

  // JSON-LD structured data for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `Bhagavad Gita Chapter ${chapter.number}: ${chapter.title}`,
    description: chapter.seo.metaDescription,
    learningResourceType: "Article",
    educationalLevel: "Beginner",
    inLanguage: "en",
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
        <Link href="/chapters" className="hover:text-saffron">
          ← All chapters
        </Link>
      </nav>

      {/* Chapter header */}
      <header className="text-center">
        <p className="font-serif text-sm font-semibold uppercase tracking-wide text-saffron">
          Chapter {chapter.number} · {chapter.sanskritName}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-maroon sm:text-5xl">
          {chapter.title}
        </h1>
        <p className="mt-3 text-lg italic text-ink-soft">{chapter.subtitle}</p>
        <p className="mt-3 text-sm text-ink-muted">
          ⏱ {chapter.readingTimeMins} min read · ~{chapter.wordCount} words
        </p>
        {progress && (
          <p className="mt-3 text-sm font-medium text-leaf">
            {progress.quiz_completed
              ? `✓ Quiz completed · best score ${progress.best_score}/${chapter.quiz.length}`
              : progress.summary_read
                ? "✓ You've started this chapter"
                : ""}
          </p>
        )}
      </header>

      <div className="divider-ornament mt-8" aria-hidden="true">
        <span>❖</span>
      </div>

      {/* Full summary */}
      <div className="mt-10">
        <ChapterContent chapter={chapter} />
      </div>

      {/* Reflection + actions */}
      <section className="mt-16 rounded-card border border-gold/20 bg-white/70 p-6 sm:p-8">
        <h3 className="font-serif text-2xl font-semibold text-maroon">
          Reflect & take the quiz
        </h3>
        <p className="mt-2 text-ink-soft">
          Save a short reflection (optional), then test what you learned.
        </p>

        {user ? (
          <ReflectionForm
            chapterNumber={chapter.number}
            initialText={null}
          />
        ) : (
          <div className="mt-4 rounded-xl bg-parchment p-4 text-sm text-ink-soft">
            <Link
              href="/auth/login"
              className="font-medium text-saffron hover:underline"
            >
              Log in
            </Link>{" "}
            to save your reflection and track your progress.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href={`/chapters/${chapter.slug}/quiz`} size="lg">
            {progress?.quiz_completed ? "Retake quiz" : "Start the quiz →"}
          </Button>
          {user && (
            <ChapterActionsClient
              chapterNumber={chapter.number}
              alreadyRead={progress?.summary_read ?? false}
            />
          )}
        </div>
      </section>

      {/* Next chapter */}
      {nextChapter && (
        <nav
          aria-label="Next chapter"
          className="mt-12 rounded-card bg-gradient-to-br from-maroon to-saffron p-6 text-center text-cream sm:p-8"
        >
          <p className="text-sm uppercase tracking-wide opacity-80">
            Up next · Chapter {nextChapter.number}
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">
            {nextChapter.title}
          </p>
          <p className="mt-1 opacity-90">{nextChapter.subtitle}</p>
          <Link
            href={`/chapters/${nextChapter.slug}`}
            className="mt-4 inline-block rounded-full bg-cream px-5 py-2 text-sm font-semibold text-maroon transition-transform hover:scale-105"
          >
            Continue →
          </Link>
        </nav>
      )}
    </div>
  );
}
