import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email confirmed",
  description: "Your email has been verified.",
};

export default function ConfirmPage() {
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
        Email confirmed!
      </h1>
      <p className="mt-3 text-ink-soft">
        Your account is now verified. You're all set to start learning.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-dark"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/chapters"
          className="rounded-full border-2 border-saffron px-6 py-3 text-sm font-semibold text-saffron transition-colors hover:bg-saffron/10"
        >
          Browse Chapters
        </Link>
      </div>
    </div>
  );
}
