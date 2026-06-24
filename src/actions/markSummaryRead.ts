"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { XP_REWARDS, computeLevel } from "@/lib/gamification/xp";
import { updateStreak } from "@/lib/gamification/streaks";
import { evaluateBadges } from "@/lib/gamification/badges";

/**
 * Marks a chapter's summary as read: awards +50 XP (once), updates the streak,
 * and re-evaluates badges (e.g. Gita Explorer at 3 summaries).
 */
export async function markSummaryRead(
  chapterNumber: number,
): Promise<{ ok: boolean; error?: string; xpAwarded?: number }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();

  // 1. Upsert progress, only awarding XP if it wasn't already read.
  const { data: existing } = await supabase
    .from("user_chapter_progress")
    .select("summary_read")
    .eq("user_id", user.id)
    .eq("chapter_number", chapterNumber)
    .maybeSingle();

  const wasRead = existing?.summary_read ?? false;

  const { error: upsertError } = await supabase
    .from("user_chapter_progress")
    .upsert(
      {
        user_id: user.id,
        chapter_number: chapterNumber,
        summary_read: true,
      },
      { onConflict: "user_id,chapter_number" },
    );

  if (upsertError) {
    return { ok: false, error: upsertError.message };
  }

  // Only proceed with XP/streak/badges if this is newly read.
  if (!wasRead) {
    // 2. Award XP.
    await supabase.from("user_xp_log").insert({
      user_id: user.id,
      amount: XP_REWARDS.readSummary,
      reason: "Read chapter summary",
      chapter_number: chapterNumber,
    });

    // 3. Update profile totals + streak + level.
    await refreshProfile(supabase, user.id);
    // 4. Evaluate badges.
    await evaluateAndAwardBadges(supabase, user.id);
  } else {
    // Even if already read, keep the streak alive for today's activity.
    await refreshProfile(supabase, user.id);
  }

  return { ok: true, xpAwarded: wasRead ? 0 : XP_REWARDS.readSummary };
}

/** Re-reads the user's aggregate state and updates the profile row. */
export async function refreshProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  // Total XP from the ledger.
  const { data: xpRows } = await supabase
    .from("user_xp_log")
    .select("amount")
    .eq("user_id", userId);
  const totalXp = (xpRows ?? []).reduce((s, r) => s + r.amount, 0);

  const { level } = computeLevel(totalXp);

  // Current profile (for streak state).
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date")
    .eq("id", userId)
    .maybeSingle();

  const streak = updateStreak({
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    lastActiveDate: profile?.last_active_date ?? null,
  });

  await supabase
    .from("profiles")
    .update({
      total_xp: totalXp,
      current_level: level,
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      last_active_date: streak.lastActiveDate,
    })
    .eq("id", userId);
}

/** Evaluates all badges and inserts any newly-earned ones. */
export async function evaluateAndAwardBadges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string[]> {
  // Gather the context needed to evaluate badges.
  const [progress, profile, xpRes, attemptsRes] = await Promise.all([
    supabase
      .from("user_chapter_progress")
      .select("summary_read, quiz_completed, chapter_completed, best_score")
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("total_xp, current_level, current_streak")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_xp_log").select("amount").eq("user_id", userId),
    supabase
      .from("user_quiz_attempts")
      .select("score, total")
      .eq("user_id", userId),
  ]);

  const rows = progress.data ?? [];
  const summariesRead = rows.filter((r) => r.summary_read).length;
  const chaptersCompleted = rows.filter((r) => r.chapter_completed).length;
  const totalXp = (xpRes.data ?? []).reduce((s, r) => s + r.amount, 0);
  const { level } = computeLevel(totalXp);

  const attempts = attemptsRes.data ?? [];
  const perfectQuizzes = attempts.filter((a) => a.score === a.total).length;
  // Approximate total correct answers from best scores per chapter.
  const totalCorrectAnswers = rows.reduce((s, r) => s + (r.best_score ?? 0), 0);

  const earned = evaluateBadges({
    totalXp,
    currentLevel: profile.data?.current_level ?? level,
    chaptersCompleted,
    summariesRead,
    perfectQuizzes,
    totalCorrectAnswers,
    currentStreak: profile.data?.current_streak ?? 0,
  });

  // Find which are newly earned.
  const { data: existingBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);
  const have = new Set((existingBadges ?? []).map((b) => b.badge_id));
  const newOnes = [...earned].filter((id) => !have.has(id));

  if (newOnes.length > 0) {
    await supabase.from("user_badges").insert(
      newOnes.map((badge_id) => ({
        user_id: userId,
        badge_id,
      })),
    );
  }

  return newOnes;
}
