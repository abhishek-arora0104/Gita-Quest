import type {
  Chapter,
  ChapterSummaryMeta,
  ComingSoonChapter,
} from "./schema";
import { chapter1 } from "./chapters/chapter-01";
import { chapter2 } from "./chapters/chapter-02";
import { chapter6 } from "./chapters/chapter-06";
import {
  chapter3,
  chapter4,
  chapter5,
  chapter7,
  chapter8,
  chapter9,
  chapter10,
  chapter11,
  chapter12,
  chapter13,
  chapter14,
  chapter15,
  chapter16,
  chapter17,
  chapter18,
} from "./chapters/remaining";

/**
 * Fully written chapters, keyed by number.
 * To add a chapter: create `chapters/chapter-NN.ts`, import it, add to this map.
 */
export const chaptersByNumber: Record<number, Chapter> = {
  1: chapter1,
  2: chapter2,
  3: chapter3,
  4: chapter4,
  5: chapter5,
  6: chapter6,
  7: chapter7,
  8: chapter8,
  9: chapter9,
  10: chapter10,
  11: chapter11,
  12: chapter12,
  13: chapter13,
  14: chapter14,
  15: chapter15,
  16: chapter16,
  17: chapter17,
  18: chapter18,
};

/** Chapters that exist in the product but aren't written yet. */
export const comingSoonChapters: ComingSoonChapter[] = [];

/** All written chapter objects. */
export const allChapters: Chapter[] = Object.values(chaptersByNumber).sort(
  (a, b) => a.number - b.number,
);

/** A chapter by slug (used in dynamic routes). */
export function getChapterBySlug(slug: string): Chapter | undefined {
  return allChapters.find((c) => c.slug === slug);
}

/** A chapter by number. */
export function getChapterByNumber(n: number): Chapter | undefined {
  return chaptersByNumber[n];
}

/**
 * The complete library list (18 entries), combining written chapters
 * with coming-soon placeholders, sorted by chapter number.
 * Used on the chapters library page.
 */
export function getLibraryList(): ChapterSummaryMeta[] {
  const written: ChapterSummaryMeta[] = allChapters.map((c) => ({
    number: c.number,
    slug: c.slug,
    title: c.title,
    sanskritName: c.sanskritName,
    subtitle: c.subtitle,
    readingTimeMins: c.readingTimeMins,
    available: true,
  }));

  const soon: ChapterSummaryMeta[] = comingSoonChapters.map((c) => ({
    number: c.number,
    slug: `chapter-${c.number}`,
    title: c.title,
    sanskritName: c.sanskritName,
    subtitle: c.theme,
    readingTimeMins: 0,
    available: false,
  }));

  return [...written, ...soon].sort((a, b) => a.number - b.number);
}

/** All valid written-chapter slugs — used by Next's generateStaticParams. */
export const writtenChapterSlugs: string[] = allChapters.map((c) => c.slug);

/** The next written chapter after a given number, if any. */
export function getNextChapter(n: number): Chapter | undefined {
  return allChapters
    .filter((c) => c.number > n)
    .sort((a, b) => a.number - b.number)[0];
}
