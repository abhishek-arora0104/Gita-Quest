"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Saves the user's Gemini API key to their profile.
 */
export async function saveGeminiApiKey(apiKey: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  if (!apiKey.trim()) {
    return { ok: false, error: "API key cannot be empty." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ gemini_api_key: apiKey.trim() })
    .eq("id", user.id);

  if (error) {
    if (error.message.includes("gemini_api_key") || error.message.includes("schema cache")) {
      return {
        ok: false,
        error:
          "Database migration needed: Please run 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gemini_api_key text;' in your Supabase SQL Editor.",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Removes the user's Gemini API key from their profile.
 */
export async function deleteGeminiApiKey(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ gemini_api_key: null })
    .eq("id", user.id);

  if (error) {
    if (error.message.includes("gemini_api_key") || error.message.includes("schema cache")) {
      return {
        ok: false,
        error:
          "Database migration needed: Please run 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gemini_api_key text;' in your Supabase SQL Editor.",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
