import { getAllChapters } from "@/lib/content";
import type { Chapter } from "@/lib/content/schema";
import type { Locale } from "@/lib/i18n/config";

export interface ChatSource {
  title: string;
  href: string;
  type: "chapter";
}

export interface ChatContext {
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  score: number;
  excerpt: string;
  sources: ChatSource[];
}

const STOP_WORDS = new Set([
  "a",
  "about",
  "and",
  "are",
  "can",
  "chapter",
  "for",
  "from",
  "gita",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "the",
  "this",
  "to",
  "what",
  "with",
  "you",
  "your",
]);

export function retrieveChatContexts({
  query,
  locale,
  limit = 3,
}: {
  query: string;
  locale: Locale;
  limit?: number;
}): ChatContext[] {
  const terms = tokenize(query);
  const chapterHint = extractChapterHint(query);
  const chapters = getAllChapters(locale);

  if (chapterHint !== null) {
    const chapter = chapters.find((item) => item.number === chapterHint);
    return chapter ? [toContext(chapter, locale, 10)] : [];
  }

  return chapters
    .map((chapter) => {
      const searchable = chapterSearchText(chapter);
      const text = searchable.toLowerCase();
      const termScore = terms.reduce(
        (score, term) => score + (text.includes(term) ? 1 : 0),
        0,
      );
      const chapterBoost = chapterHint === chapter.number ? 8 : 0;
      const titleBoost = text.includes(query.toLowerCase()) ? 3 : 0;
      return {
        chapter,
        score: termScore + chapterBoost + titleBoost,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.chapter.number - b.chapter.number)
    .slice(0, limit)
    .map(({ chapter, score }) => toContext(chapter, locale, score));
}

export function defaultChatContexts(locale: Locale): ChatContext[] {
  return getAllChapters(locale)
    .slice(0, 2)
    .map((chapter) => toContext(chapter, locale, 0));
}

export function isLikelyGitaQuestion(message: string): boolean {
  const normalized = message.toLowerCase();
  const terms = [
    "arjuna",
    "bhagavad",
    "chapter",
    "dharma",
    "gita",
    "karma",
    "krishna",
    "meditation",
    "soul",
    "yoga",
    "अर्जुन",
    "गीता",
    "कृष्ण",
    "धर्म",
    "योग",
  ];
  return terms.some((term) => normalized.includes(term)) || extractChapterHint(message) !== null;
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term))
    .slice(0, 16);
}

function extractChapterHint(input: string): number | null {
  const match =
    input.match(/chapter\s*(\d{1,2})/i) ??
    input.match(/adhyay\s*(\d{1,2})/i) ??
    input.match(/अध्याय\s*(\d{1,2})/);
  if (!match) return null;
  const value = Number(match[1]);
  return value >= 1 && value <= 18 ? value : null;
}

function chapterSearchText(chapter: Chapter): string {
  return [
    chapter.number,
    chapter.title,
    chapter.sanskritName,
    chapter.subtitle,
    chapter.intro,
    chapter.storyOverview,
    chapter.mainTeachings.map((teaching) => `${teaching.heading} ${teaching.body}`).join(" "),
    chapter.practicalExamples.map((example) => example.text).join(" "),
    chapter.lessonsForDailyLife.join(" "),
    chapter.keyTakeaways.join(" "),
    chapter.keyLessons.join(" "),
    chapter.reflectionQuestions.join(" "),
    chapter.quiz.map((q) => `${q.question} ${q.explanation}`).join(" "),
  ].join(" ");
}

function toContext(chapter: Chapter, locale: Locale, score: number): ChatContext {
  const excerpt = [
    `Chapter ${chapter.number}: ${chapter.title} (${chapter.sanskritName})`,
    `Subtitle: ${chapter.subtitle}`,
    `Intro: ${trimText(chapter.intro, 550)}`,
    `Story: ${trimText(chapter.storyOverview, 550)}`,
    `Teachings: ${chapter.mainTeachings
      .slice(0, 4)
      .map((teaching) => `${teaching.heading}: ${trimText(teaching.body, 280)}`)
      .join(" | ")}`,
    `Takeaways: ${chapter.keyTakeaways.slice(0, 6).join(" | ")}`,
    `Lessons: ${chapter.keyLessons.slice(0, 6).join(" | ")}`,
    `Reflection prompts: ${chapter.reflectionQuestions.join(" | ")}`,
    `Quiz explanations: ${chapter.quiz
      .slice(0, 8)
      .map((q) => trimText(q.explanation, 160))
      .join(" | ")}`,
  ].join("\n");

  return {
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    chapterSlug: chapter.slug,
    score,
    excerpt,
    sources: [
      {
        title: `Gita Quest: Chapter ${chapter.number}`,
        href: `/${locale}/chapters/${chapter.slug}`,
        type: "chapter",
      },
    ],
  };
}

function trimText(text: string, max: number): string {
  const squashed = text.replace(/\s+/g, " ").trim();
  return squashed.length <= max ? squashed : `${squashed.slice(0, max - 1)}…`;
}
