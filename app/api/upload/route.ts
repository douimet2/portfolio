import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'douimet2';
const GITHUB_REPO = 'portfolio';
const BRANCH = 'main';

const VALID_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];
const MAX_BYTES = 50 * 1024 * 1024;

const API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

function gh(path: string, init?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

async function ghJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await gh(path, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${init?.method || 'GET'} ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

/** Strip anything that would be awkward in a URL or a git path. */
function sanitize(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    const rawSlug = String(formData.get('projectSlug') || '');
    const projectSlug = sanitize(rawSlug);

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'Set the project slug before uploading media' },
        { status: 400 }
      );
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    for (const file of files) {
      if (!VALID_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `"${file.name}" is a ${file.type || 'unknown'} file. Allowed: JPG, PNG, WebP, GIF, MP4, WebM.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. Limit is 50MB.` },
          { status: 400 }
        );
      }
    }

    // Create one blob per file, then a single tree/commit — so N uploads produce
    // one commit and one redeploy instead of N of each.
    const entries = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { sha } = await ghJson<{ sha: string }>('/git/blobs', {
          method: 'POST',
          body: JSON.stringify({
            content: buffer.toString('base64'),
            encoding: 'base64',
          }),
        });

        const dot = file.name.lastIndexOf('.');
        const stem = sanitize(dot > 0 ? file.name.slice(0, dot) : file.name) || 'media';
        const ext = dot > 0 ? sanitize(file.name.slice(dot + 1)).toLowerCase() : 'bin';
        const filename = `${Date.now()}-${stem}.${ext}`;

        return {
          path: `public/projects/${projectSlug}/${filename}`,
          mode: '100644' as const,
          type: 'blob' as const,
          sha,
        };
      })
    );

    const ref = await ghJson<{ object: { sha: string } }>(`/git/ref/heads/${BRANCH}`);
    const baseCommitSha = ref.object.sha;
    const baseCommit = await ghJson<{ tree: { sha: string } }>(`/git/commits/${baseCommitSha}`);

    const tree = await ghJson<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: entries }),
    });

    const label = files.length === 1 ? '1 file' : `${files.length} files`;
    const commit = await ghJson<{ sha: string }>('/git/commits', {
      method: 'POST',
      body: JSON.stringify({
        message: `Add ${label} to ${projectSlug} media`,
        tree: tree.sha,
        parents: [baseCommitSha],
        author: { name: 'Portfolio Admin', email: 'admin@portfolio.local' },
      }),
    });

    await ghJson(`/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha }),
    });

    // Point at raw.githubusercontent rather than /public. Vercel bakes public/
    // into the build, so a just-committed file 404s until the next deploy
    // finishes; the raw URL serves it immediately and keeps working after.
    const paths = entries.map(
      (e) => `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/${e.path}`
    );

    return NextResponse.json({ success: true, paths, count: paths.length });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload files' },
      { status: 500 }
    );
  }
}
