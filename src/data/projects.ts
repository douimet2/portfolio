import projectsData from './projects.json';

export interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  aiContext: string;
  demoUrl?: string;
  slug: string;
  longDescription?: string;
  technologies?: string[];
  screenshots?: string[];
}

export const projects: Project[] = projectsData;
