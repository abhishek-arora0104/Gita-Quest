"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { LOCALE_META, LOCALES, withLocale } from "@/lib/i18n/config";

export function LanguageSwitcher({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div
      className="inline-flex rounded-full border border-gold/30 bg-white/70 p-0.5 text-xs font-semibold shadow-sm"
      aria-label="Language switcher"
    >
      {LOCALES.map((target) => (
        <a
          key={target}
          href={withLocale(pathname, target)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === target
              ? "bg-saffron text-white"
              : "text-ink-soft hover:bg-parchment"
          }`}
          hrefLang={LOCALE_META[target].hreflang}
        >
          {compact
            ? LOCALE_META[target].compactLabel
            : LOCALE_META[target].label}
        </a>
      ))}
    </div>
  );
}
