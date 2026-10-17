"use client";

import { useEffect, useRef, useState } from "react";

export interface Slide {
  src: string;
  video?: string;
  title: string;
}

const STILL_MS = 3600;
const VIDEO_MS = 7000;

export default function HeroReel({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only the slide on screen plays; it restarts from the top each time it comes round.
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
    if (slides.length < 2) return;
    const ms = slides[active]?.video ? VIDEO_MS : STILL_MS;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % slides.length), ms);
    return () => window.clearTimeout(timer);
  }, [active, slides]);

  return (
    <div className="hero-reel" aria-label="Screens from the apps" role="group">
      {slides.map((slide, i) => (
        <figure key={slide.src} data-active={i === active} aria-hidden={i !== active}>
          {slide.video ? (
            <video
              ref={(el) => {
                videos.current[i] = el;
              }}
              src={slide.video}
              poster={slide.src}
              muted
              playsInline
              preload={i === 0 ? "auto" : "none"}
              aria-label={`${slide.title}, the app in use`}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.src} alt={`${slide.title}, a screen from the app`} loading={i === 0 ? "eager" : "lazy"} />
          )}
          <figcaption>{slide.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}
