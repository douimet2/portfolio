import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { chapterOf, coverOf, orderedProjects, projects, startedLabel, videoOf } from "@/data/projects";
import { mediaUrl } from "@/lib/media";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: `${project.title} — Daniel Ouimet`, description: project.description };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const index = orderedProjects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = orderedProjects[index];
  const chapter = chapterOf(project);
  const next = orderedProjects[(index + 1) % orderedProjects.length];
  const nextChapter = chapterOf(next);
  const cover = coverOf(project);
  const video = videoOf(project);
  const status = project.status ?? "Live";

  const colours = {
    "--field": chapter.field,
    "--field-ink": chapter.ink,
    "--tile": chapter.tile,
  } as React.CSSProperties;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="project-top" style={colours} data-bg={chapter.field} data-ink={chapter.ink}>
          <h1 className="display" data-rise style={{ "--i": 0 } as React.CSSProperties}>
            {project.title}
          </h1>
          <p className="project-lead" data-rise style={{ "--i": 1 } as React.CSSProperties}>
            {project.description}
          </p>
          <dl className="project-facts" data-rise style={{ "--i": 2 } as React.CSSProperties}>
            <div>
              <dt>Built</dt>
              <dd>
                <Link href={`/#${chapter.id}`} className="textlink">
                  {chapter.title}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Started</dt>
              <dd className="num">{startedLabel(project)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status}</dd>
            </div>
            <div>
              <dt>Made with</dt>
              <dd>{project.technologies?.length ? project.technologies.join(", ") : "Claude Code"}</dd>
            </div>
          </dl>
          <div className="project-actions" data-rise style={{ "--i": 3 } as React.CSSProperties}>
            {project.demoUrl ? (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="button">
                Open the app <span className="arrow" aria-hidden="true">↗</span>
              </a>
            ) : (
              <>
                {cover && (
                  <a href="#media" className="button">
                    See it in use <span className="arrow" aria-hidden="true">↓</span>
                  </a>
                )}
                <p className="note">
                  {status === "Runs in the background"
                    ? "It has no screen of its own: it runs on a schedule and reports by text message."
                    : "It runs on my own computer, so there is no public link."}
                </p>
              </>
            )}
          </div>
        </section>

        {cover && (
          <div className="project-cover" id="media" style={colours}>
            <div className="frame" data-reveal>
              {video ? (
                <video
                  src={mediaUrl(video)}
                  poster={mediaUrl(cover)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={`${project.title} in use`}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(cover)} alt={`${project.title}: ${project.description}`} />
              )}
            </div>
          </div>
        )}

        <section className="project-body" data-bg="var(--bg)" data-ink="var(--ink)">
          {project.mediaNote && (
            <p className="media-note" data-reveal>
              {project.mediaNote}
            </p>
          )}
          <div className="story">
            <h2 data-reveal>What it does</h2>
            <p className="lead" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              {project.longDescription || project.description}
            </p>
          </div>
          {project.screenshots && project.screenshots.filter((s) => s !== video).length > 1 ? (
            <ScreenshotGallery
              // With a loop on top, the cover still belongs in the gallery; without one, it is already above.
              screenshots={project.screenshots.filter((s) => s !== video && (video ? true : s !== cover))}
              title={project.title}
            />
          ) : (
            !cover && (
              <div className="no-shots" data-reveal>
                <p className="lead">Screens and a short video of {project.title} are on the way.</p>
              </div>
            )
          )}
        </section>

        <Link
          href={`/projects/${next.slug}`}
          className="next-app"
          style={{ "--field": nextChapter.field, "--field-ink": nextChapter.ink } as React.CSSProperties}
          data-bg={nextChapter.field}
          data-ink={nextChapter.ink}
        >
          <span className="head">
            Next: {next.title} <span aria-hidden="true">→</span>
          </span>
          <p>{next.description}</p>
        </Link>
      </main>
      <Footer />
    </>
  );
}
