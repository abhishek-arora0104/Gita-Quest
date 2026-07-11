import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getLibraryList } from "@/lib/content";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { DailyLoginButton } from "@/components/gamification/DailyLoginButton";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return {
    title: t.nav.dashboard,
    description: t.dashboard.metaDescription,
  };
}

export default async function DashboardPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {t.dashboard.loginTitle}
        </h1>
        <p className="mt-2 text-ink-soft">
          {t.dashboard.loginBody}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/${locale}/auth/login`}
            className="rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-white"
          >
            {t.dashboard.logIn}
          </Link>
          <Link
            href={`/${locale}/auth/signup`}
            className="rounded-full border-2 border-saffron px-5 py-2.5 text-sm font-semibold text-saffron"
          >
            {t.dashboard.signUp}
          </Link>
        </div>
      </div>
    );
  }

  // ── Fetch all user state from Supabase. ──
  const supabase = await createClient();

  const [profileRes, progressRes, badgesRes, attemptsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("total_xp, current_level, current_streak, longest_streak, daily_login_claimed")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_chapter_progress")
      .select("chapter_number, summary_read, quiz_completed, chapter_completed, best_score, attempts")
      .eq("user_id", user.id),
    supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id),
    supabase
      .from("user_quiz_attempts")
      .select("score, total, mode, duration_ms")
      .eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const progress = progressRes.data ?? [];
  const earnedBadgeIds = new Set(
    (badgesRes.data ?? []).map((b) => b.badge_id),
  );
  const attempts = attemptsRes.data ?? [];

  const totalXp = profile?.total_xp ?? 0;
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  // Quiz accuracy stats.
  const totalQuestions = attempts.reduce((s, a) => s + (a.total ?? 0), 0);
  const totalCorrect = attempts.reduce((s, a) => s + (a.score ?? 0), 0);
  const avgAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const timedAttempts = attempts.filter((a) => a.mode === "timed");
  const bestTimed = timedAttempts.length
    ? timedAttempts.reduce((best, attempt) => {
        const bestScore = best.score ?? 0;
        const attemptScore = attempt.score ?? 0;
        if (attemptScore !== bestScore) {
          return attemptScore > bestScore ? attempt : best;
        }
        return (attempt.duration_ms ?? Number.MAX_SAFE_INTEGER) <
          (best.duration_ms ?? Number.MAX_SAFE_INTEGER)
          ? attempt
          : best;
      })
    : null;

  // Chapters completed count.
  const chaptersCompleted = progress.filter((p) => p.chapter_completed).length;

  // Chapter library for linking.
  const library = getLibraryList(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-maroon">
            {t.dashboard.welcome},{" "}
            <span className="text-saffron">
              {(user.email ?? t.dashboard.friend).split("@")[0]}
            </span>
          </h1>
          <p className="mt-1 text-ink-soft">
            {t.dashboard.glance}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DailyLoginButton 
            t={t} 
            alreadyClaimed={profile?.daily_login_claimed === new Date().toISOString().slice(0, 10)} 
          />
          <LogoutButton locale={locale} />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="p-5 text-center">
            <p className="text-sm text-ink-muted">{t.dashboard.chaptersCompleted}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-maroon">
              {chaptersCompleted}
              <span className="text-lg text-ink-muted">/{library.filter((c) => c.available).length}</span>
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5 text-center">
            <p className="text-sm text-ink-muted">{t.dashboard.quizAccuracy}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-maroon">
              {avgAccuracy}
              <span className="text-lg text-ink-muted">%</span>
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {totalCorrect}/{totalQuestions} {t.dashboard.correct}
            </p>
            {bestTimed && (
              <p className="mt-2 text-xs text-ink-muted">
                ⏱ Best timed: {bestTimed.score}/{bestTimed.total}
                {bestTimed.duration_ms ? (
                  <> · {Math.round(bestTimed.duration_ms / 1000)}s</>
                ) : null}
              </p>
            )}
          </div>
        </Card>
        <Card>
          <div className="p-5 flex items-center justify-center">
            <StreakCounter current={currentStreak} longest={longestStreak} t={t} />
          </div>
        </Card>
      </div>

      {/* XP & Level */}
      <Card className="mt-6">
        <div className="p-5 sm:p-6">
          <XPBar totalXp={totalXp} t={t} />
        </div>
      </Card>


      {/* Chapter progress list */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold text-maroon">
          {t.dashboard.chapterProgress}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {t.dashboard.progressBody}
        </p>
        <div className="mt-4 space-y-3">
          {library
            .filter((c) => c.available)
            .map((ch) => {
              const p = progress.find(
                (pr) => pr.chapter_number === ch.number,
              );
              const read = p?.summary_read ?? false;
              const quizzed = p?.quiz_completed ?? false;
              const best = p?.best_score ?? 0;
              return (
                <Link
                  key={ch.number}
                  href={`/${locale}/chapters/${ch.slug}`}
                  className="block"
                >
                  <Card className="transition-transform hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="flex items-center gap-4 p-4">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                          quizzed
                            ? "bg-leaf text-white"
                            : read
                              ? "bg-saffron/20 text-saffron-dark"
                              : "bg-parchment text-ink-muted"
                        }`}
                        aria-hidden="true"
                      >
                        {ch.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif font-semibold text-maroon">
                          {ch.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant={read ? "leaf" : "muted"}>
                            {read ? `${t.dashboard.readDone}` : `○ ${t.dashboard.notRead}`}
                          </Badge>
                          <Badge variant={quizzed ? "saffron" : "muted"}>
                            {quizzed
                              ? `${t.dashboard.quizDone} ${best}/${ch.quizQuestionCount}`
                              : `○ ${t.dashboard.quizPending}`}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-ink-muted" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Badges */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-maroon">
          {t.dashboard.badges}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {earnedBadgeIds.size} {t.dashboard.earnedOf}
        </p>
        <div className="mt-4">
          <BadgeGrid earnedIds={earnedBadgeIds} t={t} />
        </div>
      </section>
    </div>
  );
}
