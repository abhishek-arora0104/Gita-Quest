"use client";

import { useTransition } from "react";
import { logout } from "@/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="rounded-full border border-gold/40 bg-white/60 px-4 py-2 text-sm font-medium text-maroon transition-colors hover:bg-parchment disabled:opacity-50"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
