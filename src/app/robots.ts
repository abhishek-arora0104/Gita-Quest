import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Paths that should never be indexed, regardless of locale. */
const PROTECTED_PATHS = ["/dashboard", "/profile", "/auth/"];

function disallowEntries(): string[] {
  const paths: string[] = [];
  // Bare paths (no locale prefix)
  for (const p of PROTECTED_PATHS) paths.push(p);
  // Locale-prefixed paths
  for (const locale of LOCALES) {
    for (const p of PROTECTED_PATHS) paths.push(`/${locale}${p}`);
  }
  return paths;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowEntries(),
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
