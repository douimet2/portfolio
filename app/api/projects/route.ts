import { promises as fs } from 'fs';
import path from 'path';

const projectsPath = path.join(process.cwd(), 'src/data/projects.json');

interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  aiContext: string;
  demoUrl?: string;
  slug: string;
  longDescription?: string;
  technologies?: string[];
}

async function getProjectsFile(): Promise<Project[]> {
  try {
    const data = await fs.readFile(projectsPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProjectsFile(projects: Project[]) {
  await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2));
}

export async function GET() {
  try {
    const projects = await getProjectsFile();
    return Response.json(projects);
  } catch (error) {
    console.error('Error reading projects:', error);
    return Response.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProject: Project = await request.json();

    if (!newProject.title || !newProject.slug) {
      return Response.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const projects = await getProjectsFile();
    const projects_array = Array.isArray(projects) ? projects : [];

    // Check if slug already exists
    if (projects_array.some((p) => p.slug === newProject.slug && p.id !== newProject.id)) {
      return Response.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Add or update
    const index = projects_array.findIndex((p) => p.id === newProject.id);
    if (index >= 0) {
      projects_array[index] = newProject;
    } else {
      projects_array.push(newProject);
    }

    await saveProjectsFile(projects_array);
    return Response.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error saving project:', error);
    return Response.json({ error: 'Failed to save project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const projects = await getProjectsFile();
    const projects_array = Array.isArray(projects) ? projects : [];
    const filtered = projects_array.filter((p) => p.id !== id);

    if (filtered.length === projects_array.length) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    await saveProjectsFile(filtered);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
