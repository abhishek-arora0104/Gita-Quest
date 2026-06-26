"use client";

import { useTransition } from "react";
import { logout } from "@/actions/auth";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function LogoutButton({ locale = "en" }: { locale?: Locale }) {
  const [pending, startTransition] = useTransition();
  const t = getDictionary(locale);

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="rounded-full border border-gold/40 bg-white/60 px-4 py-2 text-sm font-medium text-maroon transition-colors hover:bg-parchment disabled:opacity-50"
    >
      {pending ? `${t.auth.logout}…` : t.auth.logout}
    </button>
  );
}
