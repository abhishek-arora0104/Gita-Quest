"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, CountUp } from "@/components/ui/Animations";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export function HomeClient({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const steps = [
    { icon: "📖", title: t.common.read, text: t.home.readBody },
    { icon: "🧘", title: t.common.reflect, text: t.home.reflectBody },
    { icon: "✅", title: t.common.quiz, text: t.home.quizBody },
    { icon: "🏆", title: t.common.grow, text: t.home.growBody },
  ];

  const features = [
    { icon: "🤖", title: t.home.feat1Title, body: t.home.feat1Body },
    { icon: "⏱️", title: t.home.feat2Title, body: t.home.feat2Body },
    { icon: "🃏", title: t.home.feat3Title, body: t.home.feat3Body },
    { icon: "🌐", title: t.home.feat4Title, body: t.home.feat4Body },
    { icon: "📊", title: t.home.feat5Title, body: t.home.feat5Body },
    { icon: "✍️", title: t.home.feat6Title, body: t.home.feat6Body },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-paper relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-24 lg:py-32">
          <ScrollReveal delay={0}>
            <p className="badge-glow mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-maroon sm:text-sm">
              <span aria-hidden="true">🕉️</span> {t.home.eyebrow}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="mx-auto max-w-3xl font-serif text-3xl font-bold leading-tight text-maroon sm:text-5xl lg:text-6xl">
              {t.home.titleA}{" "}
              <span className="text-saffron">{t.home.titleB}</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
              {t.home.subtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={`/${locale}/auth/signup`} size="md" className="px-6 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold">
                {t.home.startLearning}
              </Button>
              <Button
                href={`/${locale}/chapters`}
                size="md"
                variant="outline"
                className="px-6 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold"
              >
                {t.home.viewChapters}
              </Button>
            </div>
          </ScrollReveal>

          <div
            className="divider-ornament mt-14"
            aria-hidden="true"
          >
            <span className="animate-float inline-block text-2xl">❖</span>
          </div>
        </div>
      </section>

      {/* Why Gita Quest */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <ScrollReveal>
          <h2 className="font-serif text-3xl font-semibold text-maroon">
            {t.home.builtTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
            {t.home.builtBody}
          </p>
          <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            {[
              t.home.feature1,
              t.home.feature2,
              t.home.feature3,
              t.home.feature4,
              t.home.feature5,
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
                <span aria-hidden="true" className="mt-0.5 text-saffron">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ScrollReveal>
          <h2 className="text-center font-serif text-3xl font-semibold text-maroon">
            {t.home.howTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
            {t.home.howSubtitle}
          </p>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 120}>
              <Card className="card-hover h-full text-center">
                <div className="p-6">
                  <div
                    className="icon-bounce mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-parchment text-2xl"
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
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="bg-parchment/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <ScrollReveal>
            <h2 className="text-center font-serif text-3xl font-semibold text-maroon">
              {t.home.featuresTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-ink-soft">
              {t.home.featuresSubtitle}
            </p>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={i * 100}>
                <Card className="card-hover h-full">
                  <div className="p-6">
                    <div
                      className="icon-bounce mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-saffron/10 to-gold/10 text-2xl"
                      aria-hidden="true"
                    >
                      {feat.icon}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-maroon">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {feat.body}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Accent */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <ScrollReveal>
          <Card className="overflow-hidden">
            <div className="shimmer-overlay bg-gradient-to-br from-maroon to-saffron p-8 text-center text-cream">
              <p className="text-sm uppercase tracking-wide opacity-80">
                {t.home.journey}
              </p>
              <CountUp
                end={18}
                className="mt-2 font-serif text-5xl font-bold"
              />
              <p className="opacity-90">{t.home.chaptersWisdom}</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gold/20 text-center">
              <div className="p-5">
                <CountUp
                  end={450}
                  className="font-serif text-2xl font-bold text-maroon"
                />
                <p className="text-xs text-ink-soft">{t.home.quizQuestions}</p>
              </div>
              <div className="p-5">
                <CountUp
                  end={10}
                  className="font-serif text-2xl font-bold text-maroon"
                />
                <p className="text-xs text-ink-soft">{t.home.levels}</p>
              </div>
              <div className="p-5">
                <CountUp
                  end={10}
                  suffix="+"
                  className="font-serif text-2xl font-bold text-maroon"
                />
                <p className="text-xs text-ink-soft">{t.home.badges}</p>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ScrollReveal>
          <div className="divider-ornament mb-8" aria-hidden="true">
            <span className="animate-float inline-block text-2xl">❖</span>
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
        </ScrollReveal>
      </section>
    </>
  );
}
