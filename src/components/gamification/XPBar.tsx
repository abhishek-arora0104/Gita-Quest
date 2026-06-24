import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelProgress } from "@/lib/gamification/xp";

export function XPBar({ totalXp }: { totalXp: number }) {
  const lp = levelProgress(totalXp);

  return (
    <div>
      <div className="flex items-end justify-between text-sm">
        <div>
          <span className="font-serif text-lg font-bold text-maroon">
            Level {lp.level}
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
            ? `${lp.xpIntoLevel} / ${lp.xpForNext} XP to next level`
            : "Max level reached!"
        }
        className="mt-2"
      />
    </div>
  );
}
