"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getNextChapter } from "@/lib/content";
import type { QuizResult } from "@/actions/completeQuiz";

export function QuizResults({
  result,
  chapterNumber,
  chapterSlug,
  authenticated,
}: {
  result: QuizResult;
  chapterNumber: number;
  chapterSlug: string;
  authenticated: boolean;
}) {
  const pct = ((result.score ?? 0) / (result.total ?? 1)) * 100;
  const isPerfect = result.perfect ?? false;
  const nextCh = getNextChapter(chapterNumber);

  const message = isPerfect
    ? "Perfect score! 🎯"
    : pct >= 80
      ? "Great work! 🌟"
      : pct >= 60
        ? "Good effort! 📚"
        : pct >= 40
          ? "Keep learning! 🌱"
          : "Try again — you've got this! 💪";

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
          Your score
        </p>
        <p className="mt-2 font-serif text-5xl font-bold text-maroon">
          {result.score}/{result.total}
        </p>
        <p className="mt-2 text-xl font-semibold text-ink">{message}</p>

        <div className="mx-auto mt-4 max-w-xs">
          <ProgressBar
            value={pct}
            tone={isPerfect ? "leaf" : "saffron"}
            className="text-center"
          />
        </div>

        {authenticated && (
          <p className="mt-4 text-sm font-medium text-saffron">
            +{result.xpEarned} XP earned
            {result.points && (
              <span className="ml-2 text-ink-muted">
                · {result.points} quiz points
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
                Level Up!
              </p>
              <p className="text-ink-soft">
                You are now <strong>Level {result.newLevel}</strong> —{" "}
                <strong>{result.newLevelName}</strong>
              </p>
            </div>
          )}

          {/* New badges */}
          {result.newBadges && result.newBadges.length > 0 && (
            <div className="rounded-card border border-gold/30 bg-white/80 p-6">
              <h3 className="font-serif text-lg font-semibold text-maroon">
                🏅 Badges Earned
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {result.newBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 rounded-xl border border-gold/20 bg-parchment/60 p-3"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-sm">
                      {badge.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-maroon">{badge.name}</p>
                      <p className="text-xs text-ink-muted">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streak */}
          {result.streak && result.streak > 0 && (
            <p className="text-center text-sm text-ink-muted">
              🔥 {result.streak}-day streak
            </p>
          )}
        </div>
      )}

      {/* Not authenticated message */}
      {!authenticated && (
        <div className="rounded-card border border-gold/30 bg-parchment/60 p-5 text-center text-sm text-ink-soft">
          <Link href="/auth/signup" className="font-medium text-saffron hover:underline">
            Create a free account
          </Link>{" "}
          to save your score, earn XP, and collect badges.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          href={`/chapters/${chapterSlug}/quiz`}
          variant="outline"
          size="lg"
        >
          Retake quiz
        </Button>
        {nextCh ? (
          <Button
            href={`/chapters/${nextCh.slug}`}
            size="lg"
          >
            Next chapter →
          </Button>
        ) : (
          <Button href="/chapters" size="lg">
            View all chapters
          </Button>
        )}
      </div>

      <p className="text-center">
        <Link
          href={`/chapters/${chapterSlug}`}
          className="text-sm text-ink-muted hover:text-saffron"
        >
          ← Back to chapter summary
        </Link>
      </p>
    </div>
  );
}
