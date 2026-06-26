import type {
  Chapter,
  ChapterSummaryMeta,
  ComingSoonChapter,
} from "./schema";
export type { ChapterSummaryMeta } from "./schema";
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
import type { Locale } from "@/lib/i18n/config";
import { hiChaptersByNumber } from "./hi/chapters";
import { hinglishChaptersByNumber } from "./hinglish/chapters";

/**
 * Fully written chapters, keyed by number.
 * To add a chapter: create `chapters/chapter-NN.ts`, import it, add to this map.
 */
export const enChaptersByNumber: Record<number, Chapter> = {
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

export const chaptersByNumber = enChaptersByNumber;

export const chaptersByLocale: Record<Locale, Record<number, Chapter>> = {
  en: enChaptersByNumber,
  hi: hiChaptersByNumber,
  hinglish: hinglishChaptersByNumber,
};

/** Chapters that exist in the product but aren't written yet. */
export const comingSoonChapters: ComingSoonChapter[] = [];

/** All written chapter objects. */
export const allChapters: Chapter[] = Object.values(chaptersByNumber).sort(
  (a, b) => a.number - b.number,
);

export function getAllChapters(locale: Locale = "en"): Chapter[] {
  return Object.values(chaptersByLocale[locale]).sort(
    (a, b) => a.number - b.number,
  );
}

/** A chapter by slug (used in dynamic routes). */
export function getChapterBySlug(slug: string): Chapter | undefined {
  return allChapters.find((c) => c.slug === slug);
}

export function getChapterBySlugForLocale(
  slug: string,
  locale: Locale,
): Chapter | undefined {
  return getAllChapters(locale).find((c) => c.slug === slug);
}

/** A chapter by number. */
export function getChapterByNumber(n: number): Chapter | undefined {
  return chaptersByNumber[n];
}

export function getChapterByNumberForLocale(
  n: number,
  locale: Locale,
): Chapter | undefined {
  return chaptersByLocale[locale][n];
}

/**
 * The complete library list (18 entries), combining written chapters
 * with coming-soon placeholders, sorted by chapter number.
 * Used on the chapters library page.
 */
export function getLibraryList(locale: Locale = "en"): ChapterSummaryMeta[] {
  const written: ChapterSummaryMeta[] = getAllChapters(locale).map((c) => ({
    number: c.number,
    slug: c.slug,
    title: c.title,
    sanskritName: c.sanskritName,
    subtitle: c.subtitle,
    readingTimeMins: c.readingTimeMins,
    quizQuestionCount: c.quiz?.length ?? 25,
    available: true,
  }));

  const soon: ChapterSummaryMeta[] = comingSoonChapters.map((c) => ({
    number: c.number,
    slug: `chapter-${c.number}`,
    title: c.title,
    sanskritName: c.sanskritName,
    subtitle: c.theme,
    readingTimeMins: 0,
    quizQuestionCount: 0,
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

export function getNextChapterForLocale(
  n: number,
  locale: Locale,
): Chapter | undefined {
  return getAllChapters(locale)
    .filter((c) => c.number > n)
    .sort((a, b) => a.number - b.number)[0];
}
