import Link from "next/link";
import { NavbarClient } from "./NavbarClient";
import { NavbarScrollWrapper } from "./NavbarScrollWrapper";
import { getDictionary } from "@/lib/i18n/dictionary";
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
      <NavbarScrollWrapper>
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
            <span>Gita Quest</span>
          </Link>

          <NavbarClient locale={locale} navLinks={navLinks} homePath={homePath} />
        </nav>
      </NavbarScrollWrapper>
    </>
  );
}
