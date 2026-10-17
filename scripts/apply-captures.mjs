#!/usr/bin/env node
// Puts the captures listed in scripts/captures.json at the front of each app's screenshots in
// src/data/projects.json: the first desktop still becomes the cover, the loop the moving picture.
// Older screenshots of an app stay after them, so nothing uploaded by hand is lost.
//
//   node scripts/apply-captures.mjs            keep the older screenshots after the captures
//   node scripts/apply-captures.mjs --replace  drop the older ones for apps that were captured

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const replace = process.argv.includes('--replace');
const captures = JSON.parse(readFileSync(`${root}scripts/captures.json`, 'utf8'));
const file = `${root}src/data/projects.json`;
const projects = JSON.parse(readFileSync(file, 'utf8'));

for (const project of projects) {
  const fresh = captures[project.slug];
  if (!fresh) continue;
  const older = (project.screenshots || []).filter((s) => !s.includes('/capture/'));
  project.screenshots = replace ? fresh : [...fresh, ...older];
  console.log(`${project.slug}: ${fresh.length} captures${replace ? '' : ` + ${older.length} older`}`);
}

writeFileSync(file, JSON.stringify(projects, null, 2) + '\n');
