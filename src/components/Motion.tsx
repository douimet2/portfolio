"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Two small observers, re-run on every page:
 * - [data-reveal] elements enter once as they scroll into view (never left hidden: a timer shows
 *   anything on screen that the observer missed);
 * - [data-ink] chapters hand their colours to the fixed header as each edge passes beneath it.
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-ink]"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    targets.forEach((el) => reveal.observe(el));

    const safety = window.setTimeout(() => {
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    }, 2500);

    // A thin band at the top of the viewport, where the header sits.
    // Entries can arrive in any order after a jump, so ask which chapter is under the header now.
    const ink = new IntersectionObserver(
      () => {
        const el = chapters.find((c) => {
          const r = c.getBoundingClientRect();
          return r.top <= 30 && r.bottom > 30;
        });
        if (!el) return;
        root.style.setProperty("--header-bg", el.dataset.bg ?? "var(--bg)");
        root.style.setProperty("--header-ink", el.dataset.ink ?? "var(--ink)");
      },
      { rootMargin: "0px 0px -94% 0px", threshold: 0 }
    );
    chapters.forEach((el) => ink.observe(el));

    return () => {
      reveal.disconnect();
      ink.disconnect();
      window.clearTimeout(safety);
      root.style.removeProperty("--header-bg");
      root.style.removeProperty("--header-ink");
    };
  }, [pathname]);

  return null;
}
