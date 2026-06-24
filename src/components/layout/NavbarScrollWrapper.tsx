"use client";

import { useEffect, useState, useRef } from "react";

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const threshold = 8; // minimum scroll difference to trigger show/hide
  const topThreshold = 50; // always show when within 50px of the top

  useEffect(() => {
    // Set initial scroll position
    lastScrollY.current = window.scrollY;

    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Handle iOS elastic scroll / negative values at the top of the page
      if (currentScrollY <= topThreshold) {
        setIsVisible(true);
        lastScrollY.current = Math.max(0, currentScrollY);
        ticking = false;
        return;
      }

      // Avoid hiding/showing logic near the very bottom of the page
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScrollY >= maxScroll - 10) {
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) >= threshold) {
        if (diff > 0) {
          // Scrolling down -> hide navbar
          setIsVisible(false);
        } else {
          // Scrolling up -> show navbar
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-gold/20 bg-cream/90 backdrop-blur-md transition-transform duration-300 ease-in-out will-change-transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {children}
    </header>
  );
}
