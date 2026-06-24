import { BADGES } from "@/lib/gamification/badges";
import { Badge } from "@/components/ui/Badge";

export function BadgeGrid({
  earnedIds,
}: {
  earnedIds: Set<string> | string[];
}) {
  const earned =
    earnedIds instanceof Set ? earnedIds : new Set(earnedIds);

  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
      {BADGES.map((b) => {
        const has = earned.has(b.id);
        return (
          <div
            key={b.id}
            className={`group relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
              has
                ? "border-gold/40 bg-gold/10"
                : "border-ink-muted/20 bg-ink-muted/5 opacity-50"
            }`}
            title={has ? `${b.name}: ${b.description}` : `${b.name} (locked)`}
          >
            <span
              className={`text-2xl ${!has ? "grayscale" : ""}`}
              aria-hidden="true"
            >
              {b.icon}
            </span>
            <span className="mt-0.5 text-[10px] leading-tight font-semibold text-ink-soft text-center">
              {b.name}
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
