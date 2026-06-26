import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localeAlternates } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const t = getDictionary(locale);

  return {
    title: t.about.title,
    description: t.about.intro1,
    alternates: {
      canonical: `/${locale}/about`,
      languages: localeAlternates(siteUrl, "/about"),
    },
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  const cards = [
    { title: t.about.card1Title, body: t.about.card1Body },
    { title: t.about.card2Title, body: t.about.card2Body },
    { title: t.about.card3Title, body: t.about.card3Body },
    { title: t.about.card4Title, body: t.about.card4Body },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-center font-serif text-4xl font-bold text-maroon">
        {t.about.title}
      </h1>
      <div className="divider-ornament mt-6" aria-hidden="true">
        <span>❖</span>
      </div>

      <div className="prose-gita mt-8">
        <p>
          <strong>Gita Quest</strong> {t.about.intro1}
        </p>
        <p>{t.about.intro2}</p>
        <p>{t.about.intro3}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title}>
            <div className="p-5">
              <h2 className="font-serif text-xl font-semibold text-maroon">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">{card.body}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Spiritual dedication ── */}
      <div className="divider-ornament mt-16" aria-hidden="true">
        <span>❖</span>
      </div>

      <section className="mt-10 text-center" aria-label="Dedication">
        <p
          className="font-serif text-3xl leading-tight text-saffron-dark select-none"
          aria-hidden="true"
        >
          ॐ
        </p>

        <p className="mt-6 text-sm tracking-wide text-ink-muted uppercase">
          {t.about.developerLabel}
        </p>
        <p className="mt-1 font-serif text-xl font-semibold text-maroon">
          {t.about.developerName}
        </p>

        <div className="mx-auto mt-8 h-px w-16 bg-saffron/40" aria-hidden="true" />

        <p className="mt-8 text-sm tracking-wide text-ink-muted uppercase">
          {t.about.dedicationLabel}
        </p>
        <p className="mt-2 font-serif text-xl font-semibold leading-snug text-maroon sm:text-2xl">
          {t.about.dedicationName}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm italic text-saffron-dark">
          — {t.about.dedicationVerse}
        </p>

        <p
          className="mt-10 font-serif text-2xl text-ink-muted select-none"
          aria-hidden="true"
        >
          हरे कृष्ण
        </p>
      </section>
    </div>
  );
}
