"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
    <>
      {/* Desktop Navigation Links & Auth */}
      <div className="hidden items-center gap-6 md:flex">
        <LanguageSwitcher locale={locale} />

        {navLinks.map((link) => (
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
          <div className="flex items-center gap-3">
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
            <Link
              href={`/${locale}/settings`}
              className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-white/80 text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
              aria-label={t.nav.settings}
              title={t.nav.settings}
            >
              ⚙
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Toggle */}
      <div className="flex items-center gap-2 md:hidden">
        {user !== undefined && user && (
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-1.5 rounded-full bg-saffron px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            <span
              aria-hidden="true"
              className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px] font-bold text-white"
            >
              {(user.email ?? "U").charAt(0).toUpperCase()}
            </span>
            {t.nav.dashboard}
          </Link>
        )}

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-white/80 text-ink transition-colors hover:border-saffron"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay via Portal */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
              style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                right: 0,
                width: "85vw",
                maxWidth: "320px",
                backgroundColor: "#fbf7ef",
                color: "#3d2b1f",
                zIndex: 1000,
                boxShadow: "-8px 0 32px rgba(124, 45, 18, 0.25)",
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem",
                borderLeft: "1px solid rgba(200, 160, 68, 0.4)",
              }}
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <span className="font-serif text-lg font-bold text-maroon">Gita Quest</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-parchment text-ink-muted hover:text-ink"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* Language Selection in Drawer */}
              <div className="mt-5 border-b border-gold/20 pb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Language</p>
                <LanguageSwitcher locale={locale} />
              </div>

              {/* Nav Links */}
              <div className="mt-5 flex flex-col space-y-3">
                <Link
                  href={`/${locale}`}
                  className="rounded-xl px-3 py-2 text-base font-semibold text-maroon hover:bg-parchment"
                >
                  Home
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-3 py-2 text-base font-semibold text-ink hover:bg-parchment"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Auth / Settings in Drawer */}
              <div className="mt-auto border-t border-gold/20 pt-5">
                {user === undefined ? (
                  <div className="h-10 w-full animate-pulse rounded-full bg-parchment" />
                ) : !user ? (
                  <Link
                    href={`/${locale}/auth/login`}
                    className="flex w-full justify-center rounded-full bg-saffron py-3 text-center text-sm font-semibold text-white shadow-sm"
                  >
                    {t.nav.login}
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href={`/${locale}/dashboard`}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-saffron py-3 text-center text-sm font-semibold text-white shadow-sm"
                    >
                      {t.nav.dashboard}
                    </Link>
                    <Link
                      href={`/${locale}/settings`}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 bg-white py-2.5 text-center text-sm font-semibold text-ink"
                    >
                      ⚙ {t.nav.settings}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
