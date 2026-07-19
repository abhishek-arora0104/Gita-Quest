"use client";

import { useState, useTransition } from "react";
import { claimDailyLogin } from "@/actions/claimDailyLogin";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function DailyLoginButton({ t, lastClaimedDate = null }: { t: Dictionary, lastClaimedDate?: string | null }) {
  const [claimed, setClaimed] = useState(false);
  const [pending, startTransition] = useTransition();

  // Evaluate if claimed today on the client to avoid timezone mismatches
  useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (lastClaimedDate === today) {
      setClaimed(true);
    }
  });

  function handleClaim() {
    startTransition(async () => {
      const clientDate = new Date().toISOString().slice(0, 10);
      const res = await claimDailyLogin(clientDate);
      if (res.ok && res.awarded) {
        setClaimed(true);
      } else if (res.ok && !res.awarded) {
        setClaimed(true); // already claimed today
      }
    });
  }

  if (claimed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-leaf/40 bg-leaf/10 px-4 py-2 text-sm font-medium text-leaf">
        ✓ {t.dashboard.dailyClaimed}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClaim}
      disabled={pending}
      className="rounded-full border-2 border-gold bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold/20 disabled:opacity-50"
    >
      {pending ? t.dashboard.claiming : `☀️ ${t.dashboard.claimDaily}`}
    </button>
  );
}
