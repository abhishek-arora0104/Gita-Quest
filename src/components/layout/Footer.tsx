import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-parchment/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold text-maroon">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-cream"
            >
              ॐ
            </span>
            Gita Quest
          </div>
          <p className="max-w-md text-sm text-ink-soft">
            Understand, remember, and apply the teachings of the Bhagavad Gita —
            in simple language for modern learners.
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-soft"
            aria-label="Footer"
          >
            <Link href="/chapters" className="hover:text-saffron">
              Chapters
            </Link>
            <Link href="/about" className="hover:text-saffron">
              About
            </Link>
            <Link href="/auth/signup" className="hover:text-saffron">
              Sign up
            </Link>
          </nav>
          <div className="divider-ornament w-full" aria-hidden="true">
            <span className="text-lg">❖</span>
          </div>
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Gita Quest. All summaries are original
            and written for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
