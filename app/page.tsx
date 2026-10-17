import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Chapter from "@/components/Chapter";
import AppIndex, { type IndexApp } from "@/components/AppIndex";
import About from "@/components/About";
import Footer, { Contact } from "@/components/Footer";
import { chapterOf, chapters, coverOf, orderedProjects, startedLabel } from "@/data/projects";
import { mediaUrl } from "@/lib/media";

export default function Home() {
  const indexApps: IndexApp[] = orderedProjects.map((p) => {
    const chapter = chapterOf(p);
    const cover = coverOf(p);
    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      status: p.status ?? "Live",
      started: startedLabel(p, true),
      chapter: chapter.id,
      cover: cover ? mediaUrl(cover) : undefined,
      field: chapter.field,
      ink: chapter.ink,
    };
  });

  const filters = [{ id: "all", label: "All" }, ...chapters.map((c) => ({ id: c.id, label: c.title }))];

  return (
    <>
      <SiteHeader hideOverHero />
      <main>
        <Hero />
        {chapters.map((c) => (
          <Chapter key={c.id} chapter={c} />
        ))}
        <section id="apps" className="index" data-bg="var(--bg)" data-ink="var(--ink)" aria-label="Every app">
          <AppIndex apps={indexApps} filters={filters} />
        </section>
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
