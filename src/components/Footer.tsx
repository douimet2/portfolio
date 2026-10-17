import Link from "next/link";
import { chapters } from "@/data/projects";

export const EMAIL = "danouimet@gmail.com";
export const GITHUB = "https://github.com/douimet2";

// The name, built from blocks in the palette's colours. Heights step so the bottoms line up.
const BLOCK_COLOURS = ["var(--field-1)", "var(--field-4)", "var(--field-3)", "var(--field-2)"];
const HEIGHTS = [100, 78, 92, 64, 86, 72, 96];

function BlockWord({ word, offset }: { word: string; offset: number }) {
  return (
    <span className="word" style={{ "--len": word.length } as React.CSSProperties}>
      {word.split("").map((letter, i) => {
        const n = offset + i;
        const colour = BLOCK_COLOURS[n % BLOCK_COLOURS.length];
        return (
          <span
            key={i}
            className="block"
            data-light={colour !== "var(--field-2)"}
            style={{ "--c": colour, "--h": `${HEIGHTS[n % HEIGHTS.length]}%`, transitionDelay: `${n * 40}ms` } as React.CSSProperties}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
}

export function Contact() {
  return (
    <section id="contact" className="contact" data-bg="var(--field-2)" data-ink="var(--field-2-ink)" aria-label="Contact">
      <p data-reveal>Have a problem an app could fix? Tell me about it.</p>
      <span />
      <a className="contact-mail" href={`mailto:${EMAIL}?subject=An%20app%20idea`} data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        danouimet<span className="at">@</span>gmail.com
      </a>
      <div className="contact-foot">
        <span>Quebec, Canada · I reply in English or French</span>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer" data-bg="var(--bg)" data-ink="var(--ink)">
      <p className="blockmark" data-reveal aria-label="Daniel Ouimet">
        <BlockWord word="DANIEL" offset={0} />
        <BlockWord word="OUIMET" offset={6} />
      </p>
      <div className="footer-links">
        <ul>
          {chapters.slice(0, 2).map((c) => (
            <li key={c.id}>
              <Link href={`/#${c.id}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
        <ul>
          {chapters.slice(2).map((c) => (
            <li key={c.id}>
              <Link href={`/#${c.id}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
        <ul>
          <li>
            <Link href="/#apps">Every app</Link>
          </li>
          <li>
            <Link href="/#about">About</Link>
          </li>
        </ul>
        <ul className="contact-lines">
          <li>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              github.com/douimet2
            </a>
          </li>
        </ul>
      </div>
      <div className="footer-last">
        <span>© {new Date().getFullYear()} Daniel Ouimet</span>
        <a href="#" className="button">
          Back to top <span className="arrow" aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
