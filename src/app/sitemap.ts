import type { MetadataRoute } from "next";
import { enChaptersByNumber } from "@/lib/content";
import { LOCALES, LOCALE_META } from "@/lib/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** All chapter slugs (same for all locales). */
const chapterSlugs = Object.values(enChaptersByNumber).map((ch) => ch.slug);

function alternatesFor(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].hreflang] = `${siteUrl}/${locale}${path}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage — emit per-locale URLs
  for (const locale of LOCALES) {
    entries.push({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: alternatesFor(""),
    });
  }

  // About page — emit per-locale URLs
  for (const locale of LOCALES) {
    entries.push({
      url: `${siteUrl}/${locale}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: alternatesFor("/about"),
    });
  }

  // Chapters list — emit per-locale URLs
  for (const locale of LOCALES) {
    entries.push({
      url: `${siteUrl}/${locale}/chapters`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: alternatesFor("/chapters"),
    });
  }

  // Chapter pages — emit per-locale URLs
  for (const locale of LOCALES) {
    for (const slug of chapterSlugs) {
      entries.push({
        url: `${siteUrl}/${locale}/chapters/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternatesFor(`/chapters/${slug}`),
      });
    }
  }

  return entries;
}
