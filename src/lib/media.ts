/**
 * Media lives in the repo under public/projects/<slug>/.
 *
 * Files uploaded from the admin page are saved as full raw.githubusercontent URLs: Vercel bakes public/
 * into the build, so a freshly committed upload would 404 until the next deploy lands, and the raw
 * URL serves it immediately. Those pass through untouched.
 *
 * Paths like "/projects/<slug>/capture/..." are committed together with the code (the captures from
 * scripts/capture.mjs), so they are in the build and are served from the site itself.
 */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/?(public\/)?/, '');
  return `/${clean}`;
}

export function isVideo(path: string): boolean {
  return /\.(mp4|webm|mov)($|\?)/i.test(path);
}
