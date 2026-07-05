import Link from "next/link";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{project.icon}</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {project.aiContext}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {project.description}
        </p>

        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
          View project
          <span className="ml-2 group-hover:ml-3 transition-all">→</span>
        </div>
      </div>
    </Link>
  );
}
