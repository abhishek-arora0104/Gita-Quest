import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SettingsClient } from "./SettingsClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return {
    title: t.settings.title,
    description: t.settings.subtitle,
  };
}

export default async function SettingsPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const user = await getCurrentUser();

  let existingKey = false;
  if (user) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("profiles")
        .select("gemini_api_key")
        .eq("id", user.id)
        .single();
      existingKey = !!data?.gemini_api_key;
    } catch {
      existingKey = false;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {t.settings.title}
        </h1>
        <p className="mt-2 text-ink-soft">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="mt-8">
        <SettingsClient
          locale={locale}
          t={t}
          isAuthenticated={!!user}
          existingKey={existingKey}
        />
      </div>
    </div>
  );
}
