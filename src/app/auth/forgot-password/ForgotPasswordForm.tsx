"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
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
        <p className="text-lg font-semibold text-leaf">Check your email</p>
        <p className="mt-2 text-sm text-ink-soft">
          We've sent a password reset link to <strong>{email}</strong>. It may
          take a minute to arrive.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium text-saffron hover:underline"
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-saffron hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
