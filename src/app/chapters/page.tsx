import type { Metadata } from "next";
import Link from "next/link";
import { getLibraryList, type ChapterSummaryMeta } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const langs: Record<string, string> = {
    en: `${siteUrl}/en/chapters`,
    hi: `${siteUrl}/hi/chapters`,
    "x-default": `${siteUrl}/en/chapters`,
  };

  return {
    title: t.chapters.title,
    description: t.chapters.subtitle,
    alternates: {
      canonical: `/${locale}/chapters`,
      languages: langs,
    },
  };
}

export default async function ChaptersPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const chapters = getLibraryList(locale);
  const availableCount = chapters.filter((c) => c.available).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="text-center">
        <h1 className="font-serif text-4xl font-bold text-maroon sm:text-5xl">
          {t.chapters.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          {t.chapters.subtitle}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          {locale === "hi"
            ? `सभी ${availableCount} अध्याय उपलब्ध हैं`
            : `All ${availableCount} chapters available`}
        </p>
      </header>

      <div className="divider-ornament mt-8" aria-hidden="true">
        <span>❖</span>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c) => (
          <ChapterCard key={c.number} chapter={c} locale={locale} t={t} />
        ))}
      </div>
    </div>
  );
}

function ChapterCard({
  chapter,
  locale,
  t,
}: {
  chapter: ChapterSummaryMeta;
  locale: Locale;
  t: ReturnType<typeof getDictionary>;
}) {
  if (chapter.available) {
    return (
      <Link href={`/${locale}/chapters/${chapter.slug}`} className="group block">
        <Card className="h-full transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
          <div className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <span
                className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon font-serif text-2xl font-bold text-cream"
                aria-hidden="true"
              >
                {chapter.number}
              </span>
              <Badge variant="leaf">{t.common.available}</Badge>
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-maroon">
              {chapter.title}
            </h2>
            <p className="mt-1 text-sm italic text-saffron-dark">
              {chapter.sanskritName}
            </p>
            <p className="mt-2 flex-1 text-sm text-ink-soft">
              {chapter.subtitle}
            </p>
            <p className="mt-4 flex items-center gap-1 text-xs font-medium text-ink-muted">
              <span aria-hidden="true">⏱</span> {chapter.readingTimeMins}{" "}
              {t.common.minRead}
            </p>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="h-full opacity-70">
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <span
            className="grid h-12 w-12 place-items-center rounded-full bg-parchment font-serif text-2xl font-bold text-ink-muted"
            aria-hidden="true"
          >
            {chapter.number}
          </span>
          <Badge variant="muted">{t.common.comingSoon}</Badge>
        </div>
        <h2 className="mt-4 font-serif text-xl font-semibold text-ink-soft">
          {chapter.title}
        </h2>
        <p className="mt-1 text-sm italic text-ink-muted">
          {chapter.sanskritName}
        </p>
        <p className="mt-2 flex-1 text-sm text-ink-muted">{chapter.subtitle}</p>
      </div>
    </Card>
  );
}
