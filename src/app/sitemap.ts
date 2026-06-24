import type { MetadataRoute } from "next";
import { enChaptersByNumber } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";



/** All chapter slugs (same for both locales). */
const chapterSlugs = Object.values(enChaptersByNumber).map((ch) => ch.slug);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: `${siteUrl}/en`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
    alternates: {
      languages: {
        en: `${siteUrl}/en`,
        hi: `${siteUrl}/hi`,
      },
    },
  });

  // About page
  entries.push({
    url: `${siteUrl}/en/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
    alternates: {
      languages: {
        en: `${siteUrl}/en/about`,
        hi: `${siteUrl}/hi/about`,
      },
    },
  });

  // Chapters list
  entries.push({
    url: `${siteUrl}/en/chapters`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: {
      languages: {
        en: `${siteUrl}/en/chapters`,
        hi: `${siteUrl}/hi/chapters`,
      },
    },
  });

  // Chapter pages
  for (const slug of chapterSlugs) {
    entries.push({
      url: `${siteUrl}/en/chapters/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${siteUrl}/en/chapters/${slug}`,
          hi: `${siteUrl}/hi/chapters/${slug}`,
        },
      },
    });
  }

  return entries;
}
