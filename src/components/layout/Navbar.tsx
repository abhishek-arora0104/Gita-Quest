import Link from "next/link";
import { NavbarClient, NavbarMobileStrip } from "./NavbarClient";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";

export async function Navbar({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const navLinks = [
    { href: `/${locale}/chapters`, label: t.nav.chapters, homeOnly: false },
    { href: `/${locale}/about`, label: t.nav.about, homeOnly: false },
  ];
  const homePath = `/${locale}`;

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
          <LanguageSwitcher locale={locale} />
          <NavbarClient locale={locale} navLinks={navLinks} homePath={homePath} showLinks />
        </div>

        {/* Mobile: auth button only — links live in the bottom strip */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher locale={locale} compact />
          <NavbarClient locale={locale} showLinks={false} />
        </div>
      </nav>

      {/* Mobile bottom nav strip — rendered client-side to respect homepage hiding */}
      <NavbarMobileStrip navLinks={navLinks} homePath={homePath} />
    </header>
    </>
  );
}
