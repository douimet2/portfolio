import projectsData from './projects.json';

export type ChapterId = 'clients' | 'rentals' | 'home' | 'friends';

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
  /** Which colour chapter of the home page the app belongs to. */
  chapter?: ChapterId | string;
  /** Month of the first commit, as YYYY-MM. */
  started?: string;
  /** "Live", "Runs locally", "Runs in the background". */
  status?: string;
  /** What the pictures show when they are not the live app (sample data, an illustration). */
  mediaNote?: string;
}

export interface Chapter {
  id: ChapterId;
  title: string;
  /** One sentence under the chapter heading. */
  intro: string;
  /** CSS custom properties from the palette: field and its ink. */
  field: string;
  ink: string;
  /** Ground behind each app picture inside the chapter. */
  tile: string;
  tileInk: string;
}

export const chapters: Chapter[] = [
  {
    id: 'clients',
    title: 'For clients and work',
    intro: 'Sites and tools for a massage therapist, a physio clinic, physiotherapists and the office.',
    field: 'var(--field-1)',
    ink: 'var(--field-1-ink)',
    tile: 'var(--bg)',
    tileInk: 'var(--ink)',
  },
  {
    id: 'rentals',
    title: 'For my rentals',
    intro: 'I own rental units in Quebec. These find the next building, rent the units and keep the books.',
    field: 'var(--field-4)',
    ink: 'var(--field-4-ink)',
    tile: 'var(--field-2)',
    tileInk: 'var(--field-2-ink)',
  },
  {
    id: 'home',
    title: 'At home',
    intro: 'Old family tapes, house plants, the week’s cooking, photos, and a survey for couples.',
    field: 'var(--field-3)',
    ink: 'var(--field-3-ink)',
    tile: 'var(--bg)',
    tileInk: 'var(--ink)',
  },
  {
    id: 'friends',
    title: 'Friends and game night',
    intro: 'Party games for the TV, a gift for a friend and the late search for a hockey sub.',
    field: 'var(--field-2)',
    ink: 'var(--field-2-ink)',
    tile: 'var(--field-4)',
    tileInk: 'var(--field-4-ink)',
  },
];

export const projects: Project[] = projectsData;

export function chapterOf(project: Project): Chapter {
  return chapters.find((c) => c.id === project.chapter) ?? chapters[2];
}

export function projectsIn(chapter: ChapterId): Project[] {
  // Apps with pictures lead their chapter, so the large tiles are never empty.
  return projects
    .filter((p) => chapterOf(p).id === chapter)
    .sort((a, b) => Number(!!b.screenshots?.length) - Number(!!a.screenshots?.length));
}

/** The app order used everywhere: chapter by chapter. */
export const orderedProjects: Project[] = chapters.flatMap((c) => projectsIn(c.id));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function startedLabel(project: Project, short = false): string {
  if (!project.started) return '2026';
  const [year, month] = project.started.split('-').map(Number);
  const name = MONTHS[month - 1] ?? '';
  return `${short ? name.slice(0, 3) : name} ${year}`.trim();
}

export function earliestMonth(): string {
  const months = projects.map((p) => p.started).filter(Boolean).sort() as string[];
  if (!months.length) return '';
  return MONTHS[Number(months[0].split('-')[1]) - 1];
}

const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

export function countInWords(n: number): string {
  return WORDS[n] ?? String(n);
}

export function isLive(project: Project): boolean {
  return !!project.demoUrl && (project.status ?? 'Live') === 'Live';
}

const VIDEO = /\.(mp4|webm|mov)($|\?)/i;

/** The first still: the poster for the app's video and the picture on its tile. */
export function coverOf(project: Project): string | undefined {
  return project.screenshots?.find((s) => !VIDEO.test(s));
}

/** A phone-width capture, used where a tile is tall and narrow. */
export function phoneOf(project: Project): string | undefined {
  return project.screenshots?.find((s) => /\/phone-[^/]+$/.test(s));
}

/** The first moving picture, if the app has one. */
export function videoOf(project: Project): string | undefined {
  return project.screenshots?.find((s) => VIDEO.test(s));
}
