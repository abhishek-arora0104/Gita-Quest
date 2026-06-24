/**
 * Streak logic for daily learning habits.
 * A "qualifying" activity (reading, reflecting, quizzing, daily login)
 * updates the streak based on the last active date.
 */

export type StreakUpdate = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date (YYYY-MM-DD)
  incremented: boolean; // true if the streak grew or started today
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

/**
 * Given the user's current streak state, compute the new state for today's activity.
 * - No prior activity → streak = 1.
 * - Last active was yesterday → streak += 1.
 * - Last active was today → no change (already counted today).
 * - Gap of 2+ days → streak reset to 1.
 */
export function updateStreak(input: {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  clientDate?: string;
}): StreakUpdate {
  const today = input.clientDate || todayISO();

  if (!input.lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(input.longestStreak, 1),
      lastActiveDate: today,
      incremented: true,
    };
  }

  const diff = daysBetween(input.lastActiveDate, today);

  let newStreak: number;
  if (diff <= 0) {
    // Same day already active — no change.
    newStreak = input.currentStreak;
    return {
      currentStreak: newStreak,
      longestStreak: input.longestStreak,
      lastActiveDate: input.lastActiveDate,
      incremented: false,
    };
  } else if (diff === 1) {
    newStreak = input.currentStreak + 1;
  } else {
    newStreak = 1; // streak broken
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(input.longestStreak, newStreak),
    lastActiveDate: today,
    incremented: newStreak !== input.currentStreak,
  };
}

/** Streak milestone definitions for badges. */
export const STREAK_MILESTONES = [5, 7, 30, 60, 100] as const;
