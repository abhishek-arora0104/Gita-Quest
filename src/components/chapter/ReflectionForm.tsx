"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { saveReflection } from "@/actions/saveReflection";

export function ReflectionForm({
  chapterNumber,
  initialText,
}: {
  chapterNumber: number;
  initialText: string | null;
}) {
  const [text, setText] = useState(initialText ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await saveReflection(chapterNumber, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="mt-4">
      <Textarea
        label="Your reflection (optional)"
        name="reflection"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What lesson stood out to you? How will you apply it?"
      />
      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save reflection"}
        </Button>
        {saved && (
          <span className="text-sm text-leaf">✓ Saved</span>
        )}
      </div>
    </div>
  );
}
