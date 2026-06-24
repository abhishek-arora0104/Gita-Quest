"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { saveReflection } from "@/actions/saveReflection";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function ReflectionForm({
  chapterNumber,
  initialText,
  t,
}: {
  chapterNumber: number;
  initialText: string | null;
  t: Dictionary;
}) {
  const [text, setText] = useState(initialText ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const clientDate = new Date().toISOString().slice(0, 10);
      await saveReflection(chapterNumber, text, clientDate);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="mt-4">
      <Textarea
        label={t.reflection.label}
        name="reflection"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.reflection.placeholder}
      />
      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? t.reflection.saving : t.reflection.save}
        </Button>
        {saved && <span className="text-sm text-leaf">{t.reflection.saved}</span>}
      </div>
    </div>
  );
}
