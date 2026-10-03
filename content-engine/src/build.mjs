// One case study in, every format out.
//
//   node src/build.mjs cases/steelcon.json
//
// Source is either "url" (captured headless, see capture-url.mjs) or "video" (a phone scroll
// recording, path relative to the case file). Pulls the shots, then renders the stacked
// carousel + story maps into output/<case id>/. Until shots are picked it stops after the
// capture so you can choose them from the contact sheet.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const casePath = process.argv[2];
if (!casePath) {
  console.error('usage: node src/build.mjs <case.json>');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kase = JSON.parse(readFileSync(casePath, 'utf8'));
const out = resolve(root, 'output', kase.id);
const shots = resolve(out, 'shots');
const run = (script, ...args) =>
  execFileSync(process.execPath, [resolve(root, 'src', script), ...args], { stdio: 'inherit' });

if (kase.url) run('capture-url.mjs', kase.url, casePath, shots, '--sheet');
else run('frames-from-video.mjs', resolve(dirname(casePath), kase.video), casePath, shots, '--sheet');

if (!kase.carousel?.length || !kase.shots?.length) {
  console.log(`\nNo shots picked yet. Open ${resolve(shots, 'contact.jpg')}, fill in "shots", "carousel" and "storyMap" in ${casePath}, then run this again.`);
  process.exit(0);
}

// Colors read off the live page fill in whatever the case file's "brand" leaves out.
const captured = resolve(shots, 'brand.json');
const renderCase = resolve(out, 'case.json');
const brand = existsSync(captured) ? JSON.parse(readFileSync(captured, 'utf8')) : {};
writeFileSync(renderCase, JSON.stringify({ ...kase, brand: { ...brand, ...kase.brand } }, null, 2));
run('render-carousel.mjs', renderCase, shots, out);
console.log(`\ndone -> ${out}`);
