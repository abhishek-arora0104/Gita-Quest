"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function ForgotPasswordForm({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-leaf/30 bg-leaf/5 p-6 text-center">
        <p className="text-lg font-semibold text-leaf">{t.auth.sentTitle}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {t.auth.sentBody} <strong>{email}</strong>
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="mt-4 inline-block text-sm font-medium text-saffron hover:underline"
        >
          {t.auth.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t.auth.email}
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? t.auth.sending : t.auth.sendReset}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        {t.auth.rememberPassword}{" "}
        <Link
          href={`/${locale}/auth/login`}
          className="font-medium text-saffron hover:underline"
        >
          {t.nav.login}
        </Link>
      </p>
    </form>
  );
}
