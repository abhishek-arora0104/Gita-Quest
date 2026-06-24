"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/config";

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
      {(["en", "hi"] as const).map((target) => (
        <a
          key={target}
          href={withLocale(pathname, target)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === target
              ? "bg-saffron text-white"
              : "text-ink-soft hover:bg-parchment"
          }`}
          hrefLang={target}
        >
          {compact ? target.toUpperCase() : target === "en" ? "EN" : "हिन्दी"}
        </a>
      ))}
    </div>
  );
}
