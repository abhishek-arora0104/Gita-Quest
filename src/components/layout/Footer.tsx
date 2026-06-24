import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function Footer({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary;
}) {
  const links = [
    { href: `/${locale}/chapters`, label: t.nav.chapters },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/auth/signup`, label: t.footer.signup },
  ];

  return (
    <footer className="mt-auto border-t border-gold/20 bg-parchment/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-serif text-lg font-semibold text-maroon"
          >
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-cream"
            >
              ॐ
            </span>
            Gita Quest
          </Link>
          <p className="max-w-md text-sm text-ink-soft">
            {t.footer.description}
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-soft"
            aria-label="Footer"
          >
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-saffron">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="divider-ornament w-full" aria-hidden="true">
            <span className="text-lg">❖</span>
          </div>
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Gita Quest. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
