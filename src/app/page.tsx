import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LOCALE_META, localeAlternates } from "@/lib/i18n/config";
import { HomeClient } from "./HomeClient";

const HOME_TITLES: Record<string, string> = {
  en: "Gita Quest — Understand the Bhagavad Gita in Simple Language",
  hi: "Gita Quest — भगवद गीता को सरल भाषा में समझें",
  hinglish: "Gita Quest — Bhagavad Gita ko Aasan Bhasha mein Samjhein",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const t = getDictionary(locale);

  const title = HOME_TITLES[locale];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: t.home.subtitle,
    alternates: {
      canonical: `/${locale}`,
      languages: localeAlternates(siteUrl, "/"),
    },
    openGraph: {
      type: "website",
      title,
      description: t.home.subtitle,
      siteName: "Gita Quest",
      url: `${siteUrl}/${locale}`,
      locale: LOCALE_META[locale].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.home.subtitle,
    },
  };
}

export default async function Home() {
  const locale = await getRequestLocale();
  return <HomeClient locale={locale} />;
}
