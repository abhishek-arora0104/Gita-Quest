"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export function SignupForm() {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
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
        <p className="text-lg font-semibold text-leaf">Check your email</p>
        <p className="mt-2 text-sm text-ink-soft">
          We've sent a verification link to <strong>{email}</strong>. Click the
          link to activate your account.
        </p>
        <p className="mt-4 text-xs text-ink-muted">
          Didn't receive it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="font-medium text-saffron hover:underline"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <OAuthButtons />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Display name"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
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
          {loading ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-saffron hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
