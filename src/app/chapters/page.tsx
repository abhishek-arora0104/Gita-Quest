import type { Metadata } from "next";
import Link from "next/link";
import { getLibraryList } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "All Chapters",
  description:
    "Browse all 18 chapters of the Bhagavad Gita, each with a simplified summary and a 25-question quiz.",
  alternates: { canonical: "/chapters" },
};

export default function ChaptersPage() {
  const chapters = getLibraryList();
  const availableCount = chapters.filter((c) => c.available).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="text-center">
        <h1 className="font-serif text-4xl font-bold text-maroon sm:text-5xl">
          The 18 Chapters
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          Your journey through the Bhagavad Gita. Each chapter includes a simple
          summary, practical examples, and a 25-question quiz.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          {availableCount} of 18 chapters available · more added regularly
        </p>
      </header>

      <div className="divider-ornament mt-8" aria-hidden="true">
        <span>❖</span>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c) => (
          <ChapterCard key={c.number} chapter={c} />
        ))}
      </div>
    </div>
  );
}

function ChapterCard({
  chapter,
}: {
  chapter: ReturnType<typeof getLibraryList>[number];
}) {
  if (chapter.available) {
    return (
      <Link href={`/chapters/${chapter.slug}`} className="group block">
        <Card className="h-full transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
          <div className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <span
                className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon font-serif text-lg font-bold text-cream"
                aria-hidden="true"
              >
                {chapter.number}
              </span>
              <Badge variant="leaf">Available</Badge>
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
              <span aria-hidden="true">⏱</span> {chapter.readingTimeMins} min
              read
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
            className="grid h-12 w-12 place-items-center rounded-full bg-parchment font-serif text-lg font-bold text-ink-muted"
            aria-hidden="true"
          >
            {chapter.number}
          </span>
          <Badge variant="muted">Coming soon</Badge>
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
