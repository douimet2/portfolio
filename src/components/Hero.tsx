import Link from "next/link";
import HeroReel from "./HeroReel";
import { chapters, coverOf, countInWords, earliestMonth, orderedProjects, projects, videoOf } from "@/data/projects";
import { mediaUrl } from "@/lib/media";

export default function Hero() {
  // The adults-only survey keeps its own tile but stays out of the first screen.
  const slides = orderedProjects
    .filter((p) => p.slug !== "likes-dislikes")
    .filter((p) => !!coverOf(p))
    // Apps with a moving picture lead the reel.
    .sort((a, b) => Number(!!videoOf(b)) - Number(!!videoOf(a)))
    .map((p) => {
      const video = videoOf(p);
      return { src: mediaUrl(coverOf(p)!), video: video ? mediaUrl(video) : undefined, title: p.title };
    });

  const since = earliestMonth();
  const intro =
    "I’m Daniel Ouimet. I build working apps with Claude, for clients, for my rental units, for my family and for game night.";

  return (
    <>
      <section className="hero" id="top" aria-label="Introduction">
        <div className="hero-panel">
          <Link href="/" className="hero-wordmark" data-rise style={{ "--i": 0 } as React.CSSProperties}>
            Daniel Ouimet
          </Link>
          <h1 className="display hero-title" data-rise style={{ "--i": 1 } as React.CSSProperties}>
            {countInWords(projects.length)} apps{since ? ` since ${since}` : ""}
          </h1>
          <HeroReel slides={slides} />
          <div className="hero-foot" data-rise style={{ "--i": 2 } as React.CSSProperties}>
            <p>{intro}</p>
            <a href="#clients" className="button">
              See the apps <span className="arrow" aria-hidden="true">→</span>
            </a>
            <span />
          </div>
        </div>
        <nav className="swatches" aria-label="Chapters">
          {chapters.map((c) => (
            <a key={c.id} href={`#${c.id}`} style={{ background: c.field, color: c.ink }}>
              <span>{c.title}</span>
            </a>
          ))}
          <a href="#apps" style={{ background: "var(--surface)", color: "var(--ink)" }}>
            <span>Every app</span>
          </a>
        </nav>
      </section>
    </>
  );
}
