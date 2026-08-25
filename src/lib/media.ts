const RAW_BASE = 'https://raw.githubusercontent.com/douimet2/portfolio/main';

/**
 * Media lives in the repo under public/projects/<slug>/. Vercel bakes public/
 * into the build, so a freshly committed file 404s until the next deploy lands.
 * Serving from raw.githubusercontent avoids that gap. Older entries were saved
 * as "/projects/..." paths, so rewrite those to the same raw origin.
 */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  const withPublic = clean.startsWith('public/') ? clean : `public/${clean}`;
  return `${RAW_BASE}/${withPublic}`;
}

export function isVideo(path: string): boolean {
  return /\.(mp4|webm|mov)($|\?)/i.test(path);
}
