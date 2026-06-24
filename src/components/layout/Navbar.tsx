import Link from "next/link";
import { NavbarClient } from "./NavbarClient";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";

export async function Navbar({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const navLinks = [
    { href: `/${locale}/chapters`, label: t.nav.chapters },
    { href: `/${locale}/about`, label: t.nav.about },
  ];

  return (
    <>
      {/* Skip-to-content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-saffron focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-cream/90 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Primary"
      >
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-serif text-xl font-semibold text-maroon"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-base text-cream shadow-sm"
          >
            ॐ
          </span>
          <span className="hidden sm:inline">Gita Quest</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-saffron"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} />
          <NavbarClient locale={locale} />
        </div>

        {/* Mobile: just the auth/menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher locale={locale} compact />
          <NavbarClient locale={locale} />
        </div>
      </nav>

      {/* Mobile bottom nav strip */}
      <div className="flex border-t border-gold/10 bg-cream/50 px-4 py-2 md:hidden gap-6 justify-center">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-ink-soft transition-colors hover:text-saffron"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
    </>
  );
}
