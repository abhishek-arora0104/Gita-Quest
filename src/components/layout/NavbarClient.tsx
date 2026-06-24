"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

type NavLink = { href: string; label: string; homeOnly: boolean };

export function NavbarClient({
  locale,
  navLinks = [],
  homePath,
}: {
  locale: Locale;
  navLinks?: NavLink[];
  homePath?: string;
}) {
  const t = getDictionary(locale);
  const [user, setUser] = useState<User | null>();
  const pathname = usePathname();

  // Hide "Chapters" on the homepage
  const isHome = homePath ? pathname === homePath : false;
  const visibleLinks = navLinks.filter(
    (l) => !(isHome && l.href.endsWith("/chapters")),
  );

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

  return (
    <div className="flex items-center gap-6">
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-ink-soft transition-colors hover:text-saffron"
        >
          {link.label}
        </Link>
      ))}

      {user === undefined ? (
        <div className="h-9 w-24 animate-pulse rounded-full bg-parchment" />
      ) : !user ? (
        <Link
          href={`/${locale}/auth/login`}
          className="rounded-full border-2 border-saffron px-4 py-2 text-sm font-semibold text-saffron transition-colors hover:bg-saffron hover:text-white"
        >
          {t.nav.login}
        </Link>
      ) : (
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-dark"
        >
          <span
            aria-hidden="true"
            className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs font-bold text-white"
          >
            {(user.email ?? "U").charAt(0).toUpperCase()}
          </span>
          {t.nav.dashboard}
        </Link>
      )}
    </div>
  );
}

export function NavbarMobileStrip({
  navLinks,
  homePath,
}: {
  navLinks: NavLink[];
  homePath: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === homePath;
  const visibleLinks = navLinks.filter(
    (l) => !(isHome && l.href.endsWith("/chapters")),
  );

  if (visibleLinks.length === 0) return null;

  return (
    <div className="flex border-t border-gold/10 bg-cream/50 px-4 py-2 md:hidden gap-6 justify-center">
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-ink-soft transition-colors hover:text-saffron"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
