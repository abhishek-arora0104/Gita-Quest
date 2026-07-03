import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7c2d12",
};
import { Inter, Cormorant_Garamond, Noto_Serif_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { getRequestLocale } from "@/lib/i18n/server";
import { LOCALE_META } from "@/lib/i18n/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: "--font-noto-serif-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gita Quest — Understand the Bhagavad Gita in Simple Language",
    template: "%s · Gita Quest",
  },
  keywords: [
    "Bhagavad Gita",
    "Bhagavad Gita Chapter Summary",
    "Bhagavad Gita Explained Simply",
    "Bhagavad Gita for Beginners",
    "Learn Bhagavad Gita Online",
    "Gita Quiz",
  ],
  authors: [{ name: "Gita Quest" }],
  openGraph: {
    type: "website",
    title: "Gita Quest — Understand the Bhagavad Gita in Simple Language",
    siteName: "Gita Quest",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gita Quest — Understand the Bhagavad Gita in Simple Language",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  return (
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={`${inter.variable} ${cormorant.variable} ${notoSerifDevanagari.variable} h-full antialiased text-[18px] md:text-[20px]`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <SiteShell locale={locale}>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
