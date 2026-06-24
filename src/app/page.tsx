import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const t = getDictionary(locale);

  const title =
    locale === "hi"
      ? "Gita Quest — भगवद गीता को सरल भाषा में समझें"
      : "Gita Quest — Understand the Bhagavad Gita in Simple Language";

  const langs: Record<string, string> = {
    en: `${siteUrl}/en`,
    hi: `${siteUrl}/hi`,
    "x-default": `${siteUrl}/en`,
  };

  return {
    metadataBase: new URL(siteUrl),
    title,
    alternates: {
      canonical: `/${locale}`,
      languages: langs,
    },
    openGraph: {
      type: "website",
      title,
      description: t.home.subtitle,
      siteName: "Gita Quest",
      url: `${siteUrl}/${locale}`,
      locale: locale === "hi" ? "hi_IN" : "en_US",
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
  const t = getDictionary(locale);

  const steps = [
    { icon: "📖", title: t.common.read, text: t.home.readBody },
    { icon: "🧘", title: t.common.reflect, text: t.home.reflectBody },
    { icon: "✅", title: t.common.quiz, text: t.home.quizBody },
    { icon: "🏆", title: t.common.grow, text: t.home.growBody },
  ];

  const features = [
    t.home.feature1,
    t.home.feature2,
    t.home.feature3,
    t.home.feature4,
    t.home.feature5,
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-paper relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/60 px-4 py-1.5 text-sm font-medium text-maroon">
            <span aria-hidden="true">🕉️</span> {t.home.eyebrow}
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight text-maroon sm:text-5xl lg:text-6xl">
            {t.home.titleA}{" "}
            <span className="text-saffron">{t.home.titleB}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
            {t.home.subtitle}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={`/${locale}/auth/signup`} size="lg" className="w-full sm:w-auto">
              {t.home.startLearning}
            </Button>
            <Button
              href={`/${locale}/chapters`}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              {t.home.viewChapters}
            </Button>
          </div>

          <div
            className="divider-ornament mt-14"
            aria-hidden="true"
          >
            <span className="text-2xl">❖</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-serif text-3xl font-semibold text-maroon">
          {t.home.howTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
          {t.home.howSubtitle}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Card key={step.title} className="text-center">
              <div className="p-6">
                <div
                  className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-parchment text-2xl"
                  aria-hidden="true"
                >
                  {step.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-saffron">
                  {t.home.step} {i + 1}
                </p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-maroon">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-parchment/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-maroon">
                {t.home.builtTitle}
              </h2>
              <p className="mt-4 text-ink-soft">
                {t.home.builtBody}
              </p>
              <ul className="mt-6 space-y-3">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-xs text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href={`/${locale}/chapters`}>{t.home.browseAll}</Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-maroon to-saffron p-8 text-center text-cream">
                <p className="text-sm uppercase tracking-wide opacity-80">
                  {t.home.journey}
                </p>
                <p className="mt-2 font-serif text-5xl font-bold">18</p>
                <p className="opacity-90">{t.home.chaptersWisdom}</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gold/20 text-center">
                <div className="p-5">
                  <p className="font-serif text-2xl font-bold text-maroon">450</p>
                  <p className="text-xs text-ink-soft">{t.home.quizQuestions}</p>
                </div>
                <div className="p-5">
                  <p className="font-serif text-2xl font-bold text-maroon">10</p>
                  <p className="text-xs text-ink-soft">{t.home.levels}</p>
                </div>
                <div className="p-5">
                  <p className="font-serif text-2xl font-bold text-maroon">
                    10+
                  </p>
                  <p className="text-xs text-ink-soft">{t.home.badges}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="divider-ornament mb-8" aria-hidden="true">
          <span className="text-2xl">❖</span>
        </div>
        <h2 className="font-serif text-3xl font-semibold text-maroon sm:text-4xl">
          {t.home.ctaTitle}
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          {t.home.ctaBody}
        </p>
        <div className="mt-8">
          <Button href={`/${locale}/auth/signup`} size="lg">
            {t.home.createAccount}
          </Button>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          {t.home.alreadyLearning}{" "}
          <Link href={`/${locale}/auth/login`} className="text-saffron hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </section>
    </>
  );
}
