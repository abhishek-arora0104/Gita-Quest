import type { PracticalExample } from "@/lib/content/schema";
import { Card } from "@/components/ui/Card";

const contextIcon: Record<string, string> = {
  School: "🎒",
  College: "🎓",
  Career: "💼",
  Sports: "⚽",
  Relationships: "💞",
  "Social Media": "📱",
  "Daily Life": "🔆",
};

export function PracticalExampleList({
  examples,
}: {
  examples: PracticalExample[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {examples.map((ex, i) => (
        <Card key={i}>
          <div className="flex h-full gap-3 p-4">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-parchment text-lg"
              aria-hidden="true"
            >
              {contextIcon[ex.context] ?? "🔆"}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-saffron">
                {ex.context}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{ex.text}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
