import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelProgress } from "@/lib/gamification/xp";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function XPBar({
  totalXp,
  t,
}: {
  totalXp: number;
  t: Dictionary;
}) {
  const lp = levelProgress(totalXp);

  return (
    <div>
      <div className="flex items-end justify-between text-sm">
        <div>
          <span className="font-serif text-lg font-bold text-maroon">
            {t.dashboard.level} {lp.level}
          </span>
          <span className="ml-2 text-ink-soft">{lp.name}</span>
        </div>
        <span className="text-ink-muted">
          {totalXp.toLocaleString()} XP
        </span>
      </div>
      <ProgressBar
        value={lp.xpIntoLevel}
        max={lp.xpForNext ?? lp.xpIntoLevel}
        tone="saffron"
        label={
          lp.xpForNext
            ? `${lp.xpIntoLevel} / ${lp.xpForNext} ${t.dashboard.xpToNext}`
            : t.dashboard.maxLevel
        }
        className="mt-2"
      />
    </div>
  );
}
