"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function SignupForm({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/confirm`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Profile row is created automatically by the DB trigger.
    setEmailSent(true);
    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="rounded-2xl border border-leaf/30 bg-leaf/5 p-6 text-center">
        <p className="text-lg font-semibold text-leaf">{t.auth.checkEmail}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {t.auth.emailSent} <strong>{email}</strong>
        </p>
        <p className="mt-4 text-xs text-ink-muted">
          {t.auth.resend}{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="font-medium text-saffron hover:underline"
          >
            {t.auth.tryAgain}
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <OAuthButtons locale={locale} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.auth.displayName}
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          required
        />
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
        <Input
          label={t.auth.password}
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          minLength={6}
          required
        />

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? t.auth.creating : t.auth.create}
        </Button>

        <p className="text-center text-sm text-ink-soft">
          {t.auth.alreadyAccount}{" "}
          <Link href={`/${locale}/auth/login`} className="font-medium text-saffron hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </form>
    </div>
  );
}
