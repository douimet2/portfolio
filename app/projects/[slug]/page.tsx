import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { projects } from "@/data/projects";
import { notFound } from "next/navigation";

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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const otherProjects = projects.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-gray-200 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
            >
              <span>←</span> Back to all projects
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{project.icon}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full h-fit">
                {project.aiContext}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {project.description}
            </p>

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Live Demo
              </a>
            )}
          </div>
        </section>

        {/* Details Section */}
        <section className="py-12 sm:py-16 border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {project.longDescription || project.description}
                </p>
              </div>

              {project.technologies && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Projects */}
        {otherProjects.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">More Projects</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {otherProjects.map((relatedProject) => (
                  <Link
                    key={relatedProject.id}
                    href={`/projects/${relatedProject.slug}`}
                    className="block p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{relatedProject.icon}</span>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {relatedProject.aiContext}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {relatedProject.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {relatedProject.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
