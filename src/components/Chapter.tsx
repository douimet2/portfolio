import Link from "next/link";
import { coverOf, phoneOf, projectsIn, videoOf, startedLabel, type Chapter as ChapterData, type Project } from "@/data/projects";
import { mediaUrl } from "@/lib/media";

/** A tile's place on the four-column grid (desktop) and the two-column grid (phone). */
interface Slot {
  col: number;
  span: number;
  ratio: string;
  pcol: number;
  pspan: number;
}

const wide = (col: number, ratio = "3 / 2"): Slot => ({ col, span: 2, ratio, pcol: 1, pspan: 2 });
const single = (col: number, pcol: number): Slot => ({ col, span: 1, ratio: "4 / 5", pcol, pspan: 1 });

// Each chapter staggers its tiles differently and leaves different cells empty.
const PATTERNS: Record<string, Slot[]> = {
  clients: [wide(1), single(4, 2), single(2, 1), single(3, 2), single(1, 1), wide(3)],
  rentals: [{ col: 2, span: 3, ratio: "16 / 10", pcol: 1, pspan: 2 }, single(1, 1), wide(3), single(2, 2)],
  home: [single(1, 2), wide(3), single(2, 1), single(4, 2), wide(1), single(4, 1)],
  // Game night is played on a TV: one big screen, the other games in a strip beneath it.
  friends: [
    { col: 1, span: 4, ratio: "16 / 9", pcol: 1, pspan: 2 },
    { col: 2, span: 1, ratio: "4 / 3", pcol: 1, pspan: 1 },
    { col: 3, span: 1, ratio: "4 / 3", pcol: 2, pspan: 1 },
    { col: 4, span: 1, ratio: "4 / 3", pcol: 1, pspan: 2 },
  ],
};

function slotFor(chapter: string, index: number, hasPicture: boolean): Slot {
  const pattern = PATTERNS[chapter] ?? PATTERNS.home;
  const slot = pattern[index % pattern.length];
  // A tile with only words never takes a wide slot: it would be mostly empty colour.
  if (hasPicture || slot.span === 1 || chapter === "friends") return slot;
  return { col: slot.col, span: 1, ratio: "4 / 5", pcol: slot.pcol, pspan: 1 };
}

function Tile({ project, slot, index }: { project: Project; slot: Slot; index: number }) {
  const cover = coverOf(project);
  const video = videoOf(project);
  // Tall single tiles show the app at phone width; wide tiles show it moving at desktop width.
  const phone = slot.span === 1 && slot.ratio === "4 / 5" ? phoneOf(project) : undefined;
  const style = {
    "--col": slot.col,
    "--span": slot.span,
    "--ratio": slot.ratio,
    "--pcol": slot.pcol,
    "--pspan": slot.pspan,
    "--i": index % 2,
  } as React.CSSProperties;

  return (
    <Link href={`/projects/${project.slug}`} className="tile" style={style} data-reveal>
      <div className="tile-frame">
        {phone ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(phone)} alt={`${project.title} on a phone: ${project.description}`} loading="lazy" className="phone" />
        ) : video ? (
          <video
            src={mediaUrl(video)}
            poster={cover ? mediaUrl(cover) : undefined}
            muted
            loop
            autoPlay
            playsInline
            preload="none"
            aria-label={`${project.title}: ${project.description}`}
          />
        ) : cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(cover)} alt={`${project.title}: ${project.description}`} loading="lazy" />
        ) : (
          <div className="tile-words">
            <p className="lead">{project.description}</p>
          </div>
        )}
      </div>
      <div className="tile-caption">
        <strong>{project.title}</strong>
        <span className="num">
          {startedLabel(project, true)} · {project.status ?? "Live"}
        </span>
      </div>
      {cover && <p className="tile-desc">{project.description}</p>}
    </Link>
  );
}

export default function Chapter({ chapter }: { chapter: ChapterData }) {
  const apps = projectsIn(chapter.id);
  if (!apps.length) return null;

  const style = {
    "--field": chapter.field,
    "--field-ink": chapter.ink,
    "--tile": chapter.tile,
    "--tile-ink": chapter.tileInk,
  } as React.CSSProperties;

  return (
    <section id={chapter.id} className="chapter" style={style} data-bg={chapter.field} data-ink={chapter.ink} aria-labelledby={`${chapter.id}-title`}>
      <div className="chapter-head">
        <h2 id={`${chapter.id}-title`} className="display" data-reveal>
          {chapter.title}
        </h2>
        <p data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {chapter.intro}
          <span className="chapter-count">
            {apps.length} {apps.length === 1 ? "app" : "apps"}
          </span>
        </p>
      </div>
      <div className="tiles">
        {apps.map((project, i) => (
          <Tile key={project.id} project={project} slot={slotFor(chapter.id, i, !!coverOf(project))} index={i} />
        ))}
      </div>
    </section>
  );
}
