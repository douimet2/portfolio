import Link from "next/link";
import { isLive, orderedProjects, projects, startedLabel } from "@/data/projects";

export default function About() {
  const live = orderedProjects.filter(isLive);

  const counts = new Map<string, number>();
  for (const p of projects) for (const t of p.technologies ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  const stack = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);

  return (
    <section id="about" className="about" data-bg="var(--field-1)" data-ink="var(--field-1-ink)" aria-label="About me">
      <div className="about-row">
        <dl className="facts" data-reveal>
          <div>
            <dt>Based in</dt>
            <dd>Quebec, Canada</dd>
          </div>
          <div>
            <dt>Apps built</dt>
            <dd className="num">{projects.length}</dd>
          </div>
          <div>
            <dt>Live online</dt>
            <dd className="num">{live.length}</dd>
          </div>
        </dl>
        <div>
          <p className="lead about-text" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            I build these with Claude Code, from the first idea to a deployed app, in the evenings and on weekends. Most
            of them start with a problem in my own week: a hockey team short a player, rent to match against a
            spreadsheet, a box of old family tapes. A few became websites for clients, and they take real bookings.
          </p>
          <p className="lead about-text" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
            If you have a problem like that, an app might fix it.
          </p>
        </div>
      </div>

      <div className="about-row">
        <p className="record-word" data-reveal>
          Live now
        </p>
        <ul className="record" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {live.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`}>{p.title}</Link>
              <span className="num">{startedLabel(p, true)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="about-row">
        <p className="record-word" data-reveal>
          Built with
        </p>
        <ul className="record" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {stack.map(([name, n]) => (
            <li key={name}>
              <span>{name}</span>
              <span className="num">
                {n} {n === 1 ? "app" : "apps"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
