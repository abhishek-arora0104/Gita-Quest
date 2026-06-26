/**
 * XP (experience points) rules and level computation.
 * XP is the master progression currency. A separate "quiz score" metric
 * is tracked for stats but XP governs levels.
 */

export const XP_REWARDS = {
  readSummary: 50,
  completeQuiz: 100,
  perfectQuiz: 200, // awarded instead of completeQuiz when perfect
  completeChapter: 150,
  dailyLogin: 10,
} as const;

/**
 * Levels with their XP thresholds (cumulative total XP required to reach).
 * Index 0 = Level 1.
 */
export const LEVELS: { level: number; name: string; minXp: number }[] = [
  { level: 1, name: "Beginner", minXp: 0 },
  { level: 2, name: "Seeker", minXp: 300 },
  { level: 3, name: "Student", minXp: 800 },
  { level: 4, name: "Practitioner", minXp: 1500 },
  { level: 5, name: "Disciplined Learner", minXp: 2500 },
  { level: 6, name: "Wisdom Explorer", minXp: 3800 },
  { level: 7, name: "Yogi", minXp: 5300 },
  { level: 8, name: "Gita Scholar", minXp: 7000 },
  { level: 9, name: "Spiritual Guide", minXp: 9000 },
  { level: 10, name: "Gita Master", minXp: 12000 },
];

/** Returns the level a given total XP corresponds to (1–10). */
export function computeLevel(totalXp: number): {
  level: number;
  name: string;
} {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXp >= l.minXp) current = l;
  }
  return { level: current.level, name: current.name };
}

/** XP progress between current level and the next, for progress bars. */
export function levelProgress(totalXp: number): {
  level: number;
  name: string;
  xpIntoLevel: number;
  xpForNext: number | null; // null at max level, otherwise span of current level
  pctToNext: number; // 0–100, 100 at max level
} {
  const { level, name } = computeLevel(totalXp);
  const idx = LEVELS.findIndex((l) => l.level === level);
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];

  if (!next) {
    return {
      level,
      name,
      xpIntoLevel: totalXp - current.minXp,
      xpForNext: null,
      pctToNext: 100,
    };
  }

  const span = next.minXp - current.minXp;
  const into = totalXp - current.minXp;
  return {
    level,
    name,
    xpIntoLevel: into,
    xpForNext: span,
    pctToNext: Math.min(100, Math.round((into / span) * 100)),
  };
}

/**
 * Quiz point score (a SEPARATE metric from XP, used for stats/leaderboards).
 * correct × 10, +50 perfect bonus, +25 completion bonus.
 */
export function computeQuizScore(
  correct: number,
  total: number,
): { points: number; perfect: boolean } {
  const base = correct * 10;
  const perfect = correct === total;
  const bonus = (perfect ? 50 : 0) + 25;
  return { points: base + bonus, perfect };
}
