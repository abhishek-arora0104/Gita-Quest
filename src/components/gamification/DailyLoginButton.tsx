"use client";

import { useState, useTransition } from "react";
import { claimDailyLogin } from "@/actions/claimDailyLogin";

export function DailyLoginButton() {
  const [claimed, setClaimed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClaim() {
    startTransition(async () => {
      const res = await claimDailyLogin();
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
        ✓ Daily login claimed (+10 XP)
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
      {pending ? "Claiming…" : "☀️ Claim daily login (+10 XP)"}
    </button>
  );
}
