"use client";

import { useState, useTransition } from "react";
import { markSummaryRead } from "@/actions/markSummaryRead";

export function ChapterActionsClient({
  chapterNumber,
  alreadyRead,
}: {
  chapterNumber: number;
  alreadyRead: boolean;
}) {
  const [read, setRead] = useState(alreadyRead);
  const [pending, startTransition] = useTransition();

  function handleMarkRead() {
    startTransition(async () => {
      const res = await markSummaryRead(chapterNumber);
      if (res?.ok) setRead(true);
    });
  }

  if (read) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-leaf/10 px-4 py-2.5 text-sm font-medium text-leaf">
        ✓ Summary read (+50 XP)
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleMarkRead}
      disabled={pending}
      className="rounded-full border-2 border-saffron px-5 py-2.5 text-sm font-semibold text-saffron transition-colors hover:bg-saffron/10 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Mark summary as read (+50 XP)"}
    </button>
  );
}
