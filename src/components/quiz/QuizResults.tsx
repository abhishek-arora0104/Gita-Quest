"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getNextChapterForLocale } from "@/lib/content";
import type { QuizResult } from "@/actions/completeQuiz";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function QuizResults({
  result,
  chapterNumber,
  chapterSlug,
  authenticated,
  t,
  locale,
}: {
  result: QuizResult;
  chapterNumber: number;
  chapterSlug: string;
  authenticated: boolean;
  t: Dictionary;
  locale: Locale;
}) {
  const pct = ((result.score ?? 0) / (result.total ?? 1)) * 100;
  const isPerfect = result.perfect ?? false;
  const nextCh = getNextChapterForLocale(chapterNumber, locale);

  const message = isPerfect
    ? t.quiz.perfect
    : pct >= 80
      ? t.quiz.great
      : pct >= 60
        ? t.quiz.good
        : pct >= 40
          ? t.quiz.keepLearning
          : t.quiz.tryAgain;

  return (
    <div className="animate-pop-in space-y-8">
      {/* Score banner */}
      <div
        className={`rounded-card border-2 p-8 text-center ${
          isPerfect
            ? "border-leaf bg-leaf/10"
            : pct >= 60
              ? "border-saffron bg-saffron/10"
              : "border-gold/40 bg-parchment"
        }`}
      >
        <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          {t.quiz.yourScore}
        </p>
        <p className="mt-2 font-serif text-5xl font-bold text-maroon">
          {result.score}/{result.total}
        </p>
        <p className="mt-2 text-xl font-semibold text-ink">{message}</p>

        <div className="mx-auto mt-4 max-w-xs">
          <ProgressBar
            value={pct}
            max={100}
            tone={isPerfect ? "leaf" : "saffron"}
            className="text-center"
          />
        </div>

        {authenticated && (
          <p className="mt-4 text-sm font-medium text-saffron">
            +{result.xpEarned} {t.quiz.xpEarned}
            {result.points && (
              <span className="ml-2 text-ink-muted">
                · {result.points} {t.quiz.quizPoints}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Rewards (authenticated only) */}
      {authenticated && (
        <div className="space-y-4">
          {/* Level up */}
          {result.leveledUp && (
            <div className="animate-pop-in rounded-card border-2 border-gold bg-gradient-to-br from-gold/10 to-saffron/10 p-6 text-center">
              <p className="text-3xl" aria-hidden="true">
                ⬆️
              </p>
              <p className="mt-2 font-serif text-xl font-bold text-maroon">
                {t.quiz.levelUp}
              </p>
              <p className="text-ink-soft">
                {t.quiz.youAreNow} <strong>{t.dashboard.level} {result.newLevel}</strong> —{" "}
                <strong>{result.newLevelName}</strong>
              </p>
            </div>
          )}

          {/* New badges */}
          {result.newBadges && result.newBadges.length > 0 && (
            <div className="rounded-card border border-gold/30 bg-white/80 p-6">
              <h3 className="font-serif text-lg font-semibold text-maroon">
                🏅 {t.quiz.badgesEarned}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {result.newBadges.map((badge) => {
                  const badgeLabel = t.badges[badge.id as keyof typeof t.badges] as
                    | { name: string; description: string }
                    | undefined;
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 rounded-xl border border-gold/20 bg-parchment/60 p-3"
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-sm">
                        {badge.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-maroon">
                          {badgeLabel?.name ?? badge.name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {badgeLabel?.description ?? badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Streak */}
          {result.streak && result.streak > 0 && (
            <p className="text-center text-sm text-ink-muted">
              🔥 {result.streak}-{t.quiz.streak}
            </p>
          )}
        </div>
      )}

      {/* Not authenticated message */}
      {!authenticated && (
        <div className="rounded-card border border-gold/30 bg-parchment/60 p-5 text-center text-sm text-ink-soft">
          <Link href={`/${locale}/auth/signup`} className="font-medium text-saffron hover:underline">
            {t.quiz.signupCta}
          </Link>{" "}
          {t.quiz.signupSuffix}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          href={`/${locale}/chapters/${chapterSlug}/quiz`}
          variant="outline"
          size="lg"
        >
          {t.chapter.retakeQuiz}
        </Button>
        {nextCh ? (
          <Button
            href={`/${locale}/chapters/${nextCh.slug}`}
            size="lg"
          >
            {t.common.nextChapter} →
          </Button>
        ) : (
          <Button href={`/${locale}/chapters`} size="lg">
            {t.common.viewAllChapters}
          </Button>
        )}
      </div>

      <p className="text-center">
        <Link
          href={`/${locale}/chapters/${chapterSlug}`}
          className="text-sm text-ink-muted hover:text-saffron"
        >
          ← {t.common.backToSummary}
        </Link>
      </p>
    </div>
  );
}
