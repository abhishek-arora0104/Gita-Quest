export const LOCALES = ["en", "hi", "hinglish"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  {
    label: string;
    compactLabel: string;
    htmlLang: string;
    hreflang: string;
    ogLocale: string;
  }
> = {
  en: {
    label: "EN",
    compactLabel: "EN",
    htmlLang: "en",
    hreflang: "en",
    ogLocale: "en_US",
  },
  hi: {
    label: "हिन्दी",
    compactLabel: "HI",
    htmlLang: "hi",
    hreflang: "hi",
    ogLocale: "hi_IN",
  },
  hinglish: {
    label: "Hinglish",
    compactLabel: "Hinglish",
    htmlLang: "hi-Latn",
    hreflang: "hi-Latn",
    ogLocale: "hi_IN",
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname;
  const stripped = pathname.slice(locale.length + 1);
  return stripped.startsWith("/") ? stripped || "/" : `/${stripped}`;
}

export function withLocale(pathname: string, locale: Locale): string {
  const cleanPath = stripLocaleFromPath(pathname);
  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function localeAlternates(
  siteUrl: string,
  pathname: string,
): Record<string, string> {
  const cleanPath = stripLocaleFromPath(pathname);
  const suffix = cleanPath === "/" ? "" : cleanPath;
  return {
    ...Object.fromEntries(
      LOCALES.map((locale) => [
        LOCALE_META[locale].hreflang,
        `${siteUrl}/${locale}${suffix}`,
      ]),
    ),
    "x-default": `${siteUrl}/${DEFAULT_LOCALE}${suffix}`,
  };
}
