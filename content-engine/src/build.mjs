// One case study in, every format out.
//
//   node src/build.mjs cases/steelcon.json
//
// Reads the recording named in the case file (path relative to the case file), pulls the
// shots, and renders the stacked carousel + story maps into output/<case id>/.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const casePath = process.argv[2];
if (!casePath) {
  console.error('usage: node src/build.mjs <case.json>');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kase = JSON.parse(readFileSync(casePath, 'utf8'));
const video = resolve(dirname(casePath), kase.video);
const out = resolve(root, 'output', kase.id);
const shots = resolve(out, 'shots');
const run = (script, ...args) =>
  execFileSync(process.execPath, [resolve(root, 'src', script), ...args], { stdio: 'inherit' });

run('frames-from-video.mjs', video, casePath, shots, '--sheet');
run('render-carousel.mjs', casePath, shots, out);
console.log(`\ndone -> ${out}`);
