import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'douimet2';
const GITHUB_REPO = 'portfolio';

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectSlug = formData.get('projectSlug') as string;

    if (!file || !projectSlug) {
      return NextResponse.json(
        { error: 'File and projectSlug are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only images (JPEG, PNG, WebP) and videos (MP4, WebM) are allowed' },
        { status: 400 }
      );
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Read file and convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // Generate filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${projectSlug}-${timestamp}.${extension}`;
    const filePath = `public/projects/${projectSlug}/${filename}`;

    // Upload to GitHub
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add screenshot/video to ${projectSlug}`,
          content: base64Content,
          committer: {
            name: 'Portfolio Admin',
            email: 'admin@portfolio.local',
          },
        }),
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('GitHub API error:', error);
      throw new Error(error.message || 'Failed to upload to GitHub');
    }

    // Return the relative path to the uploaded file
    const relativePath = `/projects/${projectSlug}/${filename}`;

    return NextResponse.json({
      success: true,
      path: relativePath,
      filename,
      message: `File uploaded successfully to ${filePath}`,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
