"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { refreshProfile } from "./markSummaryRead";

/**
 * Saves (or updates) the user's reflection for a chapter.
 * Also keeps the daily streak alive.
 */
export async function saveReflection(
  chapterNumber: number,
  text: string,
  clientDate?: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_chapter_progress")
    .upsert(
      {
        user_id: user.id,
        chapter_number: chapterNumber,
        reflection_saved: text.slice(0, 5000),
      },
      { onConflict: "user_id,chapter_number" },
    );

  if (error) return { ok: false, error: error.message };

  // Keep the streak alive for today.
  await refreshProfile(supabase, user.id, clientDate);

  return { ok: true };
}
