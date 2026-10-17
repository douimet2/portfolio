#!/usr/bin/env node
// Captures screenshots and a short silent video loop of each live app, for the portfolio.
//
//   node scripts/capture.mjs                 every app below
//   node scripts/capture.mjs freeze-frame    one or more slugs
//
// Needs Node 22+, Google Chrome and ffmpeg. Writes into public/projects/<slug>/capture/ and prints the
// paths to add to src/data/projects.json (run scripts/apply-captures.mjs to do that for you).
//
// The flows only scroll, navigate and press buttons. They never submit a form, sign in or trigger a
// paid AI call, so running them costs nothing and changes nothing in the apps.

import { mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Browser, sleep } from './lib/cdp.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Drawn walkthroughs for apps with no screen of their own: one still per step, then the whole run.
const drawing = (file, steps, ms) => {
  const url = pathToFileURL(join(ROOT, 'scripts/walkthroughs', file)).href;
  return {
    drawing: true,
    phone: false,
    url,
    stills: steps.flatMap(([step, name]) => [{ goto: `${url}?step=${step}` }, { shot: name }]),
    video: [{ wait: ms }],
  };
};

const DESKTOP = { width: 1440, height: 900, dsf: 1.5 };
const PHONE = { width: 390, height: 844, dsf: 2, mobile: true };
const VIDEO = { width: 1440, height: 900, dsf: 1 };

// Apps marked `sandbox` run on this machine from a throwaway copy with sample data (a public-domain
// home movie, fictional invoices, a public-domain portrait); start those copies before capturing them.
//
// Steps: { wait }, { scroll: y, ms }, { by: dy, ms }, { click: 'text' }, { key: 'Space' }, { goto: url },
// { type: 'text', into: 'css' }, { clickAt: 'js expression giving [x, y]' }, { shot: 'name' } (stills only).
const APPS = {
  'massage-therapist': {
    url: 'https://www.kaymassotherapie.com/en',
    stills: [{ shot: 'home' }, { scroll: 900 }, { shot: 'services' }, { scroll: 1900 }, { shot: 'reviews' }, { scroll: 0 }, { click: 'Book and Relax' }, { wait: 2500 }, { shot: 'booking' }],
    video: [{ wait: 1200 }, { scroll: 2300, ms: 8000 }, { wait: 600 }, { scroll: 0, ms: 1200 }, { click: 'Book and Relax' }, { wait: 3000 }],
  },
  'physio-saint-lazare': {
    url: 'https://physio-saint-lazare.vercel.app/en',
    stills: [{ shot: 'home' }, { scroll: 900 }, { shot: 'services' }, { scroll: 2000 }, { shot: 'team' }, { scroll: 3200 }, { shot: 'clinic' }],
    video: [{ wait: 1200 }, { scroll: 4200, ms: 11000 }, { wait: 1200 }],
  },
  physiofit: {
    url: 'https://physiofit-planner.vercel.app/',
    stills: [{ shot: 'start' }, { click: 'Start intake form' }, { wait: 1500 }, { shot: 'intake' }, { by: 900 }, { shot: 'intake-2' }, { goto: 'https://physiofit-planner.vercel.app/' }, { click: 'Open clinician view' }, { wait: 1500 }, { shot: 'clinician' }],
    video: [{ wait: 1500 }, { click: 'Start intake form' }, { wait: 1500 }, { by: 1800, ms: 7000 }, { wait: 1000 }],
  },
  'rental-property': {
    url: 'https://qc-rental-analyzer.vercel.app/',
    stills: [{ shot: 'home' }, { scroll: 900 }, { shot: 'features' }, { scroll: 1800 }, { shot: 'how' }],
    video: [{ wait: 1200 }, { scroll: 2500, ms: 9000 }, { wait: 1200 }],
  },
  'mcgill-living': {
    url: 'https://www.mcgillliving.com/',
    stills: [{ shot: 'home' }, { scroll: 900 }, { shot: 'units' }, { scroll: 1800 }, { shot: 'gallery' }, { scroll: 0 }, { click: 'View details' }, { wait: 2000 }, { shot: 'unit' }],
    video: [{ wait: 1200 }, { scroll: 2000, ms: 7000 }, { wait: 500 }, { scroll: 900, ms: 1500 }, { click: 'View details' }, { wait: 2000 }, { by: 900, ms: 3500 }, { wait: 800 }],
  },
  mise: {
    url: 'https://mise-lilac-one.vercel.app/',
    stills: [{ shot: 'home' }, { scroll: 900 }, { shot: 'plan' }, { scroll: 1800 }, { shot: 'how' }, { click: 'How it works' }, { wait: 2000 }, { shot: 'how-page' }],
    video: [{ wait: 1200 }, { scroll: 2500, ms: 9000 }, { wait: 1200 }],
  },
  'likes-dislikes': {
    url: 'https://likes-and-limits.vercel.app/',
    stills: [{ shot: 'home' }, { scroll: 900 }, { shot: 'how' }, { scroll: 1900 }, { shot: 'results' }, { scroll: 3000 }, { shot: 'privacy' }],
    video: [{ wait: 1200 }, { scroll: 3600, ms: 11000 }, { wait: 1200 }],
  },
  'freeze-frame': {
    url: 'https://freeze-frame-chi.vercel.app/',
    stills: [{ shot: 'setup' }, { click: 'Start game' }, { wait: 3000 }, { shot: 'round' }, { click: 'Hint' }, { wait: 1500 }, { click: 'Hint' }, { wait: 1500 }, { click: 'Hint' }, { wait: 2000 }, { shot: 'hints' }, { click: 'Reveal' }, { wait: 2500 }, { shot: 'reveal' }],
    video: [{ wait: 1500 }, { click: 'Start game' }, { wait: 3000 }, { click: 'Hint' }, { wait: 1800 }, { click: 'Hint' }, { wait: 1800 }, { click: 'Hint' }, { wait: 1800 }, { click: 'Hint' }, { wait: 1800 }, { click: 'Reveal' }, { wait: 3500 }],
  },
  'song-snippet': {
    url: 'https://group-games-pied.vercel.app/',
    stills: [{ shot: 'hub' }, { click: 'Song Snippet' }, { wait: 2000 }, { shot: 'setup' }, { click: 'Start game' }, { wait: 3000 }, { shot: 'round' }, { click: 'Play' }, { wait: 1500 }, { click: 'Hint' }, { wait: 2000 }, { click: 'Hint' }, { wait: 2000 }, { shot: 'hints' }, { click: 'Reveal' }, { wait: 2500 }, { shot: 'reveal' }],
    video: [{ wait: 1200 }, { click: 'Song Snippet' }, { wait: 2000 }, { click: 'Start game' }, { wait: 2500 }, { click: 'Play' }, { wait: 1800 }, { click: 'Hint' }, { wait: 2000 }, { click: 'Hint' }, { wait: 2000 }, { click: 'Reveal' }, { wait: 3500 }],
  },
  vidscene: {
    sandbox: true,
    phone: false,
    url: 'http://localhost:5010/',
    stills: [{ click: 'March 1957' }, { wait: 3000 }, { shot: 'review' }, { by: 650 }, { shot: 'events' }, { by: 650 }, { shot: 'more-events' }, { goto: 'http://localhost:5010/library' }, { wait: 2000 }, { shot: 'collection' }],
    video: [{ wait: 1200 }, { click: 'March 1957' }, { wait: 3000 }, { click: '▶ Play' }, { wait: 3500 }, { by: 1400, ms: 7000 }, { wait: 1500 }],
  },
  idp: {
    sandbox: true,
    phone: false,
    url: 'http://localhost:5180/',
    stills: [{ shot: 'queue' }, { click: 'Start reviewing' }, { wait: 3000 }, { shot: 'review' }, { goto: 'http://localhost:5180/monitor' }, { wait: 2000 }, { shot: 'monitor' }, { goto: 'http://localhost:5180/classes' }, { wait: 2000 }, { shot: 'classes' }],
    // Ends by submitting the review in the sandbox, so run stills first and reset the sandbox to repeat.
    video: [
      { wait: 1500 }, { click: 'Start reviewing' }, { wait: 3000 },
      { clickAt: "(() => { const r = [...document.querySelectorAll('svg rect')].find((e) => e.getAttribute('stroke') === '#ef4444').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()" },
      { wait: 1800 }, { key: 'Enter' }, { wait: 1500 }, { click: 'ALL OTHER FIELDS' }, { wait: 2000 }, { click: 'Submit' }, { wait: 3000 },
    ],
  },
  'sub-finder': drawing('hockey-sub-finder.html', [[4, 'confirmed'], [0, 'spares'], [2, 'next'], [5, 'filled']], 15500),
  'rental-automation': drawing('rent-tracker.html', [[3, 'matched'], [0, 'email'], [4, 'paid'], [5, 'unpaid']], 15500),
  WheelOfNope: {
    url: 'https://the-no-ball.vercel.app/',
    stills: [{ shot: 'wheel' }, { type: 'Drive Kevin to the airport at 5am', into: 'input, textarea' }, { wait: 500 }, { shot: 'asked' }],
    video: [{ wait: 1200 }, { type: 'Help my cousin move on Saturday', into: 'input, textarea', slow: true }, { wait: 2000 }],
  },
};

const clickText = (page, text) =>
  page.eval((text) => {
    const els = [...document.querySelectorAll('button, a, [role=button]')].filter((e) => e.offsetParent !== null || e.getClientRects().length);
    const el = els.find((e) => (e.innerText || '').trim().startsWith(text)) || els.find((e) => (e.innerText || '').includes(text));
    if (!el) return false;
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    el.click();
    return true;
  }, text);

// Eased scroll driven by requestAnimationFrame, so it looks like a person scrolling.
const scrollTo = (page, y, ms) =>
  page.eval(({ y, ms }) => new Promise((done) => {
    const start = scrollY, target = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
    if (!ms) { scrollTo({ top: target, behavior: 'instant' }); return done(); }
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo({ top: start + (target - start) * ease(t), behavior: 'instant' });
      t < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  }), { y, ms });

async function typeInto(page, selector, text, slow) {
  await page.eval((sel) => { const el = document.querySelector(sel); el?.focus(); return !!el; }, selector);
  for (const ch of text) {
    await page.send('Input.insertText', { text: ch });
    await sleep(slow ? 70 : 5);
  }
}

async function runStep(page, step, onShot) {
  if (step.wait) await sleep(step.wait);
  if (step.goto) await page.goto(step.goto, { settleMs: 2000 });
  if (step.scroll !== undefined) await scrollTo(page, step.scroll, step.ms ?? 0);
  if (step.by !== undefined) {
    const y = await page.eval('scrollY');
    await scrollTo(page, y + step.by, step.ms ?? 0);
  }
  if (step.click && !(await clickText(page, step.click))) console.warn(`    no button "${step.click}"`);
  if (step.key) {
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: step.key === 'Space' ? ' ' : step.key, code: step.key, windowsVirtualKeyCode: step.key === 'Enter' ? 13 : undefined, text: step.key === 'Enter' ? '\r' : undefined });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: step.key === 'Space' ? ' ' : step.key, code: step.key });
  }
  if (step.type) await typeInto(page, step.into, step.type, step.slow);
  if (step.clickAt) {
    const [x, y] = await page.eval(step.clickAt);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await page.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
      await sleep(type === 'mouseMoved' ? 400 : 60);
    }
  }
  if (step.shot && onShot) { await sleep(700); await onShot(step.shot); }
}

// Each recording starts as a first visit: no saved game, no dismissed banner.
async function freshVisit(page, url) {
  await page.goto(url, { settleMs: 500 });
  await page.eval(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  await page.goto(url, { settleMs: 3000 });
}

async function stills(browser, slug, app, dir) {
  const files = [];
  const page = await browser.newPage(DESKTOP);
  await freshVisit(page, app.url);
  for (const step of app.stills) {
    await runStep(page, step, async (name) => {
      const file = `desktop-${files.length + 1}-${name}.jpg`;
      await page.screenshot({ path: join(dir, file), quality: 82 });
      files.push(file);
    });
  }
  await page.close();

  if (app.phone === false) return files;
  const phone = await browser.newPage(PHONE);
  await freshVisit(phone, app.url);
  await phone.screenshot({ path: join(dir, 'phone-1.jpg'), quality: 82 });
  files.push('phone-1.jpg');
  await phone.close();
  return files;
}

async function video(browser, slug, app, dir) {
  const page = await browser.newPage(VIDEO);
  await freshVisit(page, app.url);

  const frameDir = join(tmpdir(), `capture-${slug}-${Date.now()}`);
  mkdirSync(frameDir, { recursive: true });
  const frames = [];
  const off = browser.on(page.sessionId, 'Page.screencastFrame', (p) => {
    const file = join(frameDir, `${String(frames.length).padStart(5, '0')}.jpg`);
    writeFileSync(file, Buffer.from(p.data, 'base64'));
    frames.push({ file, t: p.metadata.timestamp });
    page.send('Page.screencastFrameAck', { sessionId: p.sessionId }).catch(() => {});
  });
  await page.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: VIDEO.width, maxHeight: VIDEO.height, everyNthFrame: 1 });
  const started = Date.now() / 1000;
  for (const step of app.video) await runStep(page, step);
  const ended = Date.now() / 1000;
  await page.send('Page.stopScreencast').catch(() => {});
  off();
  await page.close();

  if (frames.length < 2) throw new Error('no frames recorded');
  // Frames arrive only when the screen changes; hold each one until the next.
  const lines = ['ffconcat version 1.0'];
  frames.forEach((f, i) => {
    const next = frames[i + 1]?.t ?? ended - started + frames[0].t;
    lines.push(`file '${f.file}'`, `duration ${Math.max(0.001, next - f.t).toFixed(3)}`);
  });
  lines.push(`file '${frames.at(-1).file}'`);
  const list = join(frameDir, 'list.txt');
  writeFileSync(list, lines.join('\n'));

  const out = join(dir, 'loop.mp4');
  execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-vf', 'fps=30,scale=1440:-2:flags=lanczos,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', '-an', out,
  ]);
  rmSync(frameDir, { recursive: true, force: true });
  return 'loop.mp4';
}

const only = process.argv.slice(2);
const targets = Object.entries(APPS).filter(([slug]) => !only.length || only.includes(slug));
const browser = await Browser.launch();
const summaryFile = join(ROOT, 'scripts/captures.json');
const summary = existsSync(summaryFile) ? JSON.parse(readFileSync(summaryFile, 'utf8')) : {};
for (const [slug, app] of targets) {
  const dir = join(ROOT, 'public/projects', slug, 'capture');
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  console.log(`• ${slug}`);
  try {
    const shots = await stills(browser, slug, app, dir);
    const clip = await video(browser, slug, app, dir);
    summary[slug] = [shots[0], clip, ...shots.slice(1)].map((f) => `/projects/${slug}/capture/${f}`);
    console.log(`    ${readdirSync(dir).length} files`);
  } catch (e) {
    console.error(`    failed: ${e.message}`);
  }
}
await browser.close();
writeFileSync(summaryFile, JSON.stringify(summary, null, 2) + '\n');
console.log('Wrote scripts/captures.json');
