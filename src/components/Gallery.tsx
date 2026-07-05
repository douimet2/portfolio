import ProjectCard from "./ProjectCard";
import type { Project } from "@/data/projects";

interface GalleryProps {
  projects: Project[];
}

export default function Gallery({ projects }: GalleryProps) {
  return (
    <section id="gallery" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
