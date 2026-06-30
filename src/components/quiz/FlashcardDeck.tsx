"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Flashcard = {
  front: string;
  back: string;
};

export function FlashcardDeck({
  cards,
  t,
}: {
  cards: Flashcard[];
  t: Dictionary;
}) {
  const [deck, setDeck] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = deck[currentIndex];
  const canMove = deck.length > 1;
  const visibleText = flipped ? current?.back : current?.front;

  const status = useMemo(
    () => `${Math.min(currentIndex + 1, deck.length)} / ${deck.length}`,
    [currentIndex, deck.length],
  );

  function move(delta: number) {
    setCurrentIndex((idx) => {
      const next = (idx + delta + deck.length) % deck.length;
      return next;
    });
    setFlipped(false);
  }

  function shuffleDeck() {
    setDeck((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setCurrentIndex(0);
    setFlipped(false);
  }

  if (!current) return null;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className={cn(
          "flex min-h-72 w-full flex-col items-center justify-center rounded-card border-2 border-saffron/30 bg-white/80 p-8 text-center shadow-sm transition-colors hover:bg-saffron/5",
          flipped && "border-leaf/40 bg-leaf/10",
        )}
      >
        <span className="text-xs font-semibold uppercase text-saffron">
          {t.quiz.flip}
        </span>
        <span className="mt-5 font-serif text-2xl font-semibold leading-relaxed text-maroon">
          {visibleText}
        </span>
      </button>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => move(-1)}
          disabled={!canMove}
        >
          {t.quiz.prev}
        </Button>
        <span className="text-sm font-semibold text-ink-muted">{status}</span>
        <Button
          variant="outline"
          onClick={() => move(1)}
          disabled={!canMove}
        >
          {t.quiz.next}
        </Button>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={shuffleDeck} disabled={!canMove}>
          {t.quiz.shuffle}
        </Button>
      </div>
    </div>
  );
}
