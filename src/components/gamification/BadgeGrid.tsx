import { BADGES } from "@/lib/gamification/badges";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function BadgeGrid({
  earnedIds,
  t,
}: {
  earnedIds: Set<string> | string[];
  t: Dictionary;
}) {
  const earned =
    earnedIds instanceof Set ? earnedIds : new Set(earnedIds);

  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
      {BADGES.map((b) => {
        const has = earned.has(b.id);
        const label = t.badges[b.id as keyof typeof t.badges] as
          | { name: string; description: string }
          | undefined;
        const name = label?.name ?? b.name;
        const description = label?.description ?? b.description;
        return (
          <div
            key={b.id}
            className={`group relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
              has
                ? "border-gold/40 bg-gold/10"
                : "border-ink-muted/20 bg-ink-muted/5 opacity-50"
            }`}
            title={has ? `${name}: ${description}` : `${name} ${t.badges.lockedSuffix}`}
          >
            <span
              className={`text-2xl ${!has ? "grayscale" : ""}`}
              aria-hidden="true"
            >
              {b.icon}
            </span>
            <span className="mt-0.5 text-[10px] leading-tight font-semibold text-ink-soft text-center">
              {name}
            </span>
            {!has && (
              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-cream/70 text-lg">
                🔒
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
