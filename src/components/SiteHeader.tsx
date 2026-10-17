"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SiteHeaderProps {
  /** On the home page the hero carries its own navigation, so the bar waits until it has scrolled away. */
  hideOverHero?: boolean;
}

export default function SiteHeader({ hideOverHero = false }: SiteHeaderProps) {
  const [hidden, setHidden] = useState(hideOverHero);

  useEffect(() => {
    if (!hideOverHero) return;
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "-60px 0px 0px 0px",
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [hideOverHero]);

  return (
    <header className="site-header" data-hidden={hidden}>
      <Link href="/" className="wordmark">
        Daniel Ouimet
      </Link>
      <nav aria-label="Main">
        <Link href="/#apps">Every app</Link>
        <Link href="/#about" className="optional">
          About
        </Link>
        <Link href="/#contact">Write to me</Link>
      </nav>
    </header>
  );
}
