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

interface GitHubFileResponse {
  content: string;
  sha: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'douimet2';
const GITHUB_REPO = 'portfolio';
const FILE_PATH = 'src/data/projects.json';

async function getProjectsFromGitHub(): Promise<{ projects: Project[]; sha: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = (await response.json()) as GitHubFileResponse;
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  const projects = JSON.parse(content) as Project[];

  return { projects, sha: data.sha };
}

async function saveProjectsToGitHub(projects: Project[], sha: string, message: string) {
  const content = Buffer.from(JSON.stringify(projects, null, 2)).toString('base64');

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content,
        sha,
        committer: {
          name: 'Portfolio Admin',
          email: 'admin@portfolio.local',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('GitHub API error:', error);
    throw new Error(error.message || 'Failed to save to GitHub');
  }

  const data = (await response.json()) as { commit: { sha: string } };
  return data;
}

export async function GET() {
  try {
    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const { projects } = await getProjectsFromGitHub();
    return Response.json(projects);
  } catch (error) {
    console.error('Error reading projects from GitHub:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to read projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const newProject: Project = await request.json();

    if (!newProject.title || !newProject.slug) {
      return Response.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const { projects, sha } = await getProjectsFromGitHub();

    // Check if slug already exists
    if (projects.some((p) => p.slug === newProject.slug && p.id !== newProject.id)) {
      return Response.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Add or update
    const index = projects.findIndex((p) => p.id === newProject.id);
    const isNew = index < 0;
    if (index >= 0) {
      projects[index] = newProject;
    } else {
      projects.push(newProject);
    }

    const message = isNew ? `Add project: ${newProject.title}` : `Update project: ${newProject.title}`;
    await saveProjectsToGitHub(projects, sha, message);

    return Response.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error saving project:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to save project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const { projects, sha } = await getProjectsFromGitHub();
    const projectToDelete = projects.find((p) => p.id === id);

    if (!projectToDelete) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const filtered = projects.filter((p) => p.id !== id);
    await saveProjectsToGitHub(filtered, sha, `Delete project: ${projectToDelete.title}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    );
  }
}
