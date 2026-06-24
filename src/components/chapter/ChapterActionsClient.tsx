"use client";

import { useState, useTransition } from "react";
import { markSummaryRead } from "@/actions/markSummaryRead";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function ChapterActionsClient({
  chapterNumber,
  alreadyRead,
  locale = "en",
}: {
  chapterNumber: number;
  alreadyRead: boolean;
  locale?: Locale;
}) {
  const t = getDictionary(locale);
  const [read, setRead] = useState(alreadyRead);
  const [pending, startTransition] = useTransition();

  function handleMarkRead() {
    startTransition(async () => {
      const clientDate = new Date().toISOString().slice(0, 10);
      const res = await markSummaryRead(chapterNumber, clientDate);
      if (res?.ok) setRead(true);
    });
  }

  if (read) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-leaf/10 px-4 py-2.5 text-sm font-medium text-leaf">
        ✓ {t.chapter.summaryRead}
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
      {pending ? t.chapter.saving : t.chapter.markRead}
    </button>
  );
}
