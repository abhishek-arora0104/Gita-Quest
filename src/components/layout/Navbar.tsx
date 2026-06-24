import Link from "next/link";
import { NavbarClient } from "./NavbarClient";

const navLinks = [
  { href: "/chapters", label: "Chapters" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  return (
    <>
      {/* Skip-to-content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-saffron focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-cream/90 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-maroon"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-base text-cream shadow-sm"
          >
            ॐ
          </span>
          <span className="hidden sm:inline">Gita Quest</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-saffron"
            >
              {link.label}
            </Link>
          ))}
          <NavbarClient />
        </div>

        {/* Mobile: just the auth/menu button */}
        <div className="md:hidden">
          <NavbarClient />
        </div>
      </nav>
    </header>
    </>
  );
}
