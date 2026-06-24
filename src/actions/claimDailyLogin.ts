"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { XP_REWARDS } from "@/lib/gamification/xp";
import { refreshProfile, evaluateAndAwardBadges } from "./markSummaryRead";

/**
 * Awards the +10 daily-login XP, but only once per calendar day.
 */
export async function claimDailyLogin(clientDate?: string): Promise<{
  ok: boolean;
  awarded?: boolean;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const today = clientDate ?? new Date().toISOString().slice(0, 10);

  // Attempt to atomically update the daily_login_claimed flag.
  // We only want to update if it's currently distinct from 'today'.
  const { data: updatedProfiles, error: updateError } = await supabase
    .from("profiles")
    .update({ daily_login_claimed: today })
    .eq("id", user.id)
    .or(`daily_login_claimed.neq.${today},daily_login_claimed.is.null`)
    .select("id");

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const awarded = (updatedProfiles ?? []).length > 0;

  if (awarded) {
    await supabase.from("user_xp_log").insert({
      user_id: user.id,
      amount: XP_REWARDS.dailyLogin,
      reason: "Daily login",
    });
  }

  await refreshProfile(supabase, user.id, today);
  await evaluateAndAwardBadges(supabase, user.id);

  return { ok: true, awarded };
}
