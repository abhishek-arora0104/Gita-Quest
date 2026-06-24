/**
 * Content model for Gita Quest chapters.
 * All chapter content (summaries + quizzes) is stored as static TS files
 * and statically rendered for SEO. See CONTENT_GUIDE.md for writing rules.
 */

export type Difficulty = "easy" | "medium" | "hard";

export type ExampleContext =
  | "School"
  | "College"
  | "Career"
  | "Sports"
  | "Relationships"
  | "Social Media"
  | "Daily Life";

export interface QuizQuestion {
  id: string;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  /** Index 0–3 of the correct option. */
  correctIndex: 0 | 1 | 2 | 3;
  /** Shown after answering, regardless of right/wrong. */
  explanation: string;
}

export interface PracticalExample {
  context: ExampleContext;
  text: string;
}

export interface MainTeaching {
  heading: string;
  body: string;
}

export interface Chapter {
  number: number;
  slug: string;
  title: string;
  /** Sanskrit name, e.g. "Arjuna Visada Yoga". */
  sanskritName: string;
  /** One-line subtitle / theme. */
  subtitle: string;
  /** Estimated reading time in minutes. */
  readingTimeMins: number;
  /** Approximate word count of the summary body. */
  wordCount: number;

  /** Plain-English intro (2–3 short paragraphs). */
  intro: string;
  /** What happens in the chapter, told simply. */
  storyOverview: string;
  /** Core teachings, each with a heading and plain-English body. */
  mainTeachings: MainTeaching[];
  /** 5–10+ relatable real-life examples. */
  practicalExamples: PracticalExample[];
  /** How to apply the chapter day to day. */
  lessonsForDailyLife: string[];
  /** 5–10 crisp, memorable takeaways. */
  keyTakeaways: string[];
  /** 5–10 short "key lessons" bullets (distinct from takeaways). */
  keyLessons: string[];
  /** Reflection prompts shown after reading. */
  reflectionQuestions: string[];

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };

  /** Exactly 25 questions: 10 easy / 10 medium / 5 hard. */
  quiz: QuizQuestion[];
}

/** A lighter catalog entry used on the chapter library page. */
export interface ChapterSummaryMeta {
  number: number;
  slug: string;
  title: string;
  sanskritName: string;
  subtitle: string;
  readingTimeMins: number;
  quizQuestionCount: number;
  available: boolean;
}

/** Chapters that exist in the product but aren't written yet. */
export interface ComingSoonChapter {
  number: number;
  title: string;
  sanskritName: string;
  theme: string;
}
