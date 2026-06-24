import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "saffron" | "gold" | "leaf" | "muted" | "locked";
  className?: string;
};

const variants = {
  default: "bg-parchment text-maroon border-gold/30",
  saffron: "bg-saffron/15 text-saffron-dark border-saffron/30",
  gold: "bg-gold/20 text-gold-dark border-gold/40",
  leaf: "bg-leaf/15 text-leaf border-leaf/30",
  muted: "bg-ink-muted/15 text-ink-soft border-ink-muted/25",
  locked: "bg-ink-muted/10 text-ink-muted border-ink-muted/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
