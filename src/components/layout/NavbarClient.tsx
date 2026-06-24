"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function NavbarClient({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-parchment" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/auth/login`}
          className="text-sm font-medium text-ink-soft transition-colors hover:text-saffron"
        >
          {t.nav.login}
        </Link>
        <Link
          href={`/${locale}/auth/signup`}
          className="rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-dark"
        >
          {t.nav.startLearning}
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/${locale}/dashboard`}
      className="flex items-center gap-2 rounded-full bg-parchment px-3 py-1.5 text-sm font-medium text-maroon transition-colors hover:bg-gold-light/40"
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-xs text-cream"
      >
        {(user.email ?? "U").charAt(0).toUpperCase()}
      </span>
      <span className="hidden sm:inline">{t.nav.dashboard}</span>
    </Link>
  );
}
