import { cn } from "@/lib/utils/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  tone?: "saffron" | "gold" | "leaf";
};

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  tone = "saffron",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const toneClass =
    tone === "gold"
      ? "from-gold to-gold-light"
      : tone === "leaf"
        ? "from-leaf to-leaf-light"
        : "from-saffron to-saffron-light";

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-soft">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-parchment"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
            toneClass,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
