"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getChapterByNumber } from "@/lib/content";
import {
  XP_REWARDS,
  computeLevel,
  computeQuizScore,
} from "@/lib/gamification/xp";
import { refreshProfile, evaluateAndAwardBadges } from "./markSummaryRead";
import { BADGES_BY_ID } from "@/lib/gamification/badges";

export interface QuizResult {
  ok: boolean;
  error?: string;
  score?: number;
  total?: number;
  points?: number;
  perfect?: boolean;
  xpEarned?: number;
  leveledUp?: boolean;
  newLevel?: number;
  newLevelName?: string;
  newBadges?: { id: string; name: string; icon: string; description: string }[];
  streak?: number;
}

/**
 * Processes a completed quiz atomically:
 *  1. record the attempt,
 *  2. upsert progress (best score, attempts, completion, chapter completion),
 *  3. award XP (quiz complete / perfect / chapter complete),
 *  4. refresh profile (xp, level, streak),
 *  5. evaluate badges.
 *
 * `answers` is an array of the option index chosen for each question
 * (or null if skipped), in question order.
 */
export async function completeQuiz(
  chapterNumber: number,
  answers: (number | null)[],
): Promise<QuizResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const chapter = getChapterByNumber(chapterNumber);
  if (!chapter) return { ok: false, error: "Chapter not found" };

  const supabase = await createClient();

  // ── Score the attempt against the source-of-truth questions. ──
  const questions = chapter.quiz;
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct += 1;
  });
  const total = questions.length;
  const { points, perfect } = computeQuizScore(correct, total);

  // Capture the level BEFORE awarding XP, to detect a level-up.
  const { data: beforeProfile } = await supabase
    .from("profiles")
    .select("total_xp, current_level")
    .eq("id", user.id)
    .maybeSingle();
  const prevLevel = beforeProfile?.current_level ?? 1;

  // ── 1. Record the attempt. ──
  const { error: attemptError } = await supabase
    .from("user_quiz_attempts")
    .insert({
      user_id: user.id,
      chapter_number: chapterNumber,
      answers: answers,
      score: correct,
      total,
    });
  if (attemptError) return { ok: false, error: attemptError.message };

  // ── 2. Upsert progress. ──
  const { data: existing } = await supabase
    .from("user_chapter_progress")
    .select(
      "best_score, attempts, summary_read, quiz_completed, chapter_completed",
    )
    .eq("user_id", user.id)
    .eq("chapter_number", chapterNumber)
    .maybeSingle();

  const prevBest = existing?.best_score ?? 0;
  const prevAttempts = existing?.attempts ?? 0;
  const summaryAlreadyRead = existing?.summary_read ?? false;
  const alreadyCompletedChapter = existing?.chapter_completed ?? false;

  const bestScore = Math.max(prevBest, correct);
  const quizCompleted = true;
  // A chapter is "completed" once the quiz is done (summary is optional but encouraged).
  const chapterCompleted = quizCompleted;

  const { error: progressError } = await supabase
    .from("user_chapter_progress")
    .upsert(
      {
        user_id: user.id,
        chapter_number: chapterNumber,
        best_score: bestScore,
        attempts: prevAttempts + 1,
        quiz_completed: quizCompleted,
        chapter_completed: chapterCompleted,
        last_attempt_at: new Date().toISOString(),
        completed_at: chapterCompleted ? new Date().toISOString() : null,
        // Preserve a previously-saved reflection/summary flag.
        summary_read: summaryAlreadyRead,
      },
      { onConflict: "user_id,chapter_number" },
    );
  if (progressError) return { ok: false, error: progressError.message };

  // ── 3. Award XP. ──
  const xpEntries: { amount: number; reason: string }[] = [];

  // Quiz completion XP (perfect replaces base with the bigger reward).
  if (perfect) {
    xpEntries.push({
      amount: XP_REWARDS.perfectQuiz,
      reason: "Perfect quiz score",
    });
  } else {
    xpEntries.push({
      amount: XP_REWARDS.completeQuiz,
      reason: "Completed quiz",
    });
  }

  // Chapter completion XP — only the first time the chapter is completed.
  if (chapterCompleted && !alreadyCompletedChapter) {
    xpEntries.push({
      amount: XP_REWARDS.completeChapter,
      reason: "Completed chapter",
    });
  }

  if (xpEntries.length > 0) {
    await supabase.from("user_xp_log").insert(
      xpEntries.map((e) => ({
        user_id: user.id,
        amount: e.amount,
        reason: e.reason,
        chapter_number: chapterNumber,
      })),
    );
  }

  const xpEarned = xpEntries.reduce((s, e) => s + e.amount, 0);

  // ── 4. Refresh profile (totals, level, streak). ──
  await refreshProfile(supabase, user.id);

  // ── 5. Evaluate badges. ──
  const newBadgeIds = await evaluateAndAwardBadges(supabase, user.id);

  // ── Build the response. ──
  const { data: afterProfile } = await supabase
    .from("profiles")
    .select("current_level, current_streak")
    .eq("id", user.id)
    .maybeSingle();
  const newLevel = afterProfile?.current_level ?? prevLevel;
  const leveledUp = newLevel > prevLevel;
  const { name: newLevelName } = computeLevel(
    (beforeProfile?.total_xp ?? 0) + xpEarned,
  );

  const newBadges = newBadgeIds
    .map((id) => BADGES_BY_ID[id])
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      description: b.description,
    }));

  return {
    ok: true,
    score: correct,
    total,
    points,
    perfect,
    xpEarned,
    leveledUp,
    newLevel,
    newLevelName: leveledUp ? newLevelName : undefined,
    newBadges,
    streak: afterProfile?.current_streak ?? 0,
  };
}
