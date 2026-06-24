/**
 * Badge catalog and evaluation logic.
 * Badges are awarded based on a snapshot of the user's progress.
 */

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-chapter",
    name: "First Steps",
    description: "Complete your first chapter.",
    icon: "🌟",
  },
  {
    id: "chapter-master",
    name: "Chapter Master",
    description: "Complete all 18 chapters.",
    icon: "🏆",
  },
  {
    id: "quiz-champion",
    name: "Quiz Champion",
    description: "Get a perfect score on any quiz.",
    icon: "🎯",
  },
  {
    id: "century-correct",
    name: "Century of Wisdom",
    description: "Answer 100 questions correctly.",
    icon: "💯",
  },
  {
    id: "gita-explorer",
    name: "Gita Explorer",
    description: "Read 3 chapter summaries.",
    icon: "🧭",
  },
  {
    id: "streak-5",
    name: "5-Day Streak",
    description: "Learn 5 days in a row.",
    icon: "🔥",
  },
  {
    id: "streak-7",
    name: "7-Day Streak",
    description: "Learn 7 days in a row.",
    icon: "⚡",
  },
  {
    id: "streak-30",
    name: "30-Day Streak",
    description: "Learn 30 days in a row.",
    icon: "💎",
  },
  {
    id: "gita-scholar",
    name: "Gita Scholar",
    description: "Reach level 8 (Gita Scholar).",
    icon: "📖",
  },
  {
    id: "gita-master",
    name: "Gita Master",
    description: "Reach level 10 (Gita Master).",
    icon: "👑",
  },
];

export const BADGES_BY_ID: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);

/** Snapshot of progress used to evaluate badges. */
export interface BadgeContext {
  totalXp: number;
  currentLevel: number;
  chaptersCompleted: number;
  summariesRead: number;
  perfectQuizzes: number;
  totalCorrectAnswers: number;
  currentStreak: number;
}

/**
 * Returns the full set of badge IDs the user has EARNED given a context.
 * Compare against the previously-earned set to find new ones.
 */
export function evaluateBadges(ctx: BadgeContext): Set<string> {
  const earned = new Set<string>();

  if (ctx.chaptersCompleted >= 1) earned.add("first-chapter");
  if (ctx.chaptersCompleted >= 18) earned.add("chapter-master");
  if (ctx.perfectQuizzes >= 1) earned.add("quiz-champion");
  if (ctx.totalCorrectAnswers >= 100) earned.add("century-correct");
  if (ctx.summariesRead >= 3) earned.add("gita-explorer");
  if (ctx.currentStreak >= 5) earned.add("streak-5");
  if (ctx.currentStreak >= 7) earned.add("streak-7");
  if (ctx.currentStreak >= 30) earned.add("streak-30");
  if (ctx.currentLevel >= 8) earned.add("gita-scholar");
  if (ctx.currentLevel >= 10) earned.add("gita-master");

  return earned;
}
