"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { XP_REWARDS } from "@/lib/gamification/xp";
import { refreshProfile, evaluateAndAwardBadges } from "./markSummaryRead";

/**
 * Awards the +10 daily-login XP, but only once per calendar day.
 */
export async function claimDailyLogin(): Promise<{
  ok: boolean;
  awarded?: boolean;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_login_claimed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.daily_login_claimed === today) {
    // Already claimed today — still refresh streak/session.
    await refreshProfile(supabase, user.id);
    return { ok: true, awarded: false };
  }

  await supabase.from("user_xp_log").insert({
    user_id: user.id,
    amount: XP_REWARDS.dailyLogin,
    reason: "Daily login",
  });

  await supabase
    .from("profiles")
    .update({ daily_login_claimed: today })
    .eq("id", user.id);

  await refreshProfile(supabase, user.id);
  await evaluateAndAwardBadges(supabase, user.id);

  return { ok: true, awarded: true };
}
