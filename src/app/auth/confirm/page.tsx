import type { Metadata } from "next";
import Link from "next/link";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return {
    title: t.auth.confirmTitle,
    description: t.auth.confirmBody,
    robots: { index: false },
  };
}

export default async function ConfirmPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-leaf/10">
        <svg
          className="h-8 w-8 text-leaf"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="mt-6 font-serif text-3xl font-bold text-maroon">
        {t.auth.confirmTitle}
      </h1>
      <p className="mt-3 text-ink-soft">
        {t.auth.confirmBody}
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={`/${locale}/dashboard`}
          className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-dark"
        >
          {t.auth.goDashboard}
        </Link>
        <Link
          href={`/${locale}/chapters`}
          className="rounded-full border-2 border-saffron px-6 py-3 text-sm font-semibold text-saffron transition-colors hover:bg-saffron/10"
        >
          {t.auth.browseChapters}
        </Link>
      </div>
    </div>
  );
}
