import type {
  Chapter,
  ChapterSummaryMeta,
  ComingSoonChapter,
} from "./schema";
import { chapter1 } from "./chapters/chapter-01";
import { chapter2 } from "./chapters/chapter-02";
import { chapter6 } from "./chapters/chapter-06";

/**
 * Fully written chapters, keyed by number.
 * To add a chapter: create `chapters/chapter-NN.ts`, import it, add to this map.
 */
export const chaptersByNumber: Record<number, Chapter> = {
  1: chapter1,
  2: chapter2,
  6: chapter6,
};

/** Chapters that exist in the product but aren't written yet. */
export const comingSoonChapters: ComingSoonChapter[] = [
  { number: 3, title: "The Yoga of Action", sanskritName: "Karma Yoga", theme: "Selfless action in depth" },
  { number: 4, title: "The Yoga of Knowledge", sanskritName: "Jnana Yoga", theme: "Wisdom and the nature of action" },
  { number: 5, title: "The Yoga of Renunciation", sanskritName: "Karma Sanyasa Yoga", theme: "Renouncing while still acting" },
  { number: 7, title: "Knowledge of the Absolute", sanskritName: "Jnana Vijnana Yoga", theme: "Knowing the Divine" },
  { number: 8, title: "Attaining the Supreme", sanskritName: "Aksara Brahma Yoga", theme: "The eternal and devotion at death" },
  { number: 9, title: "The King of Knowledge", sanskritName: "Raja Vidya Yoga", theme: "The most confidential wisdom" },
  { number: 10, title: "Divine Manifestations", sanskritName: "Vibhuti Yoga", theme: "God's presence in all things" },
  { number: 11, title: "The Universal Form", sanskritName: "Visvarupa Darshana Yoga", theme: "Krishna reveals his cosmic form" },
  { number: 12, title: "The Yoga of Devotion", sanskritName: "Bhakti Yoga", theme: "The path of love and devotion" },
  { number: 13, title: "Nature and the Self", sanskritName: "Ksetra Ksetrajna Vibhaga Yoga", theme: "Body, soul, and the knower" },
  { number: 14, title: "The Three Modes", sanskritName: "Guna Traya Vibhaga Yoga", theme: "The gunas: goodness, passion, darkness" },
  { number: 15, title: "The Supreme Person", sanskritName: "Purushottama Yoga", theme: "The Supreme Self beyond all" },
  { number: 16, title: "Divine and Demoniac Natures", sanskritName: "Daivasura Sampad Vibhaga Yoga", theme: "Two paths of living" },
  { number: 17, title: "The Threefold Faith", sanskritName: "Sraddha Traya Vibhaga Yoga", theme: "Faith shaped by the gunas" },
  { number: 18, title: "The Path to Liberation", sanskritName: "Moksha Sanyasa Yoga", theme: "Final teachings and freedom" },
];

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
