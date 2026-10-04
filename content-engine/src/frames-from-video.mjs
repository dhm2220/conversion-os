// Pull crisp stills out of a scroll recording.
//
//   node src/frames-from-video.mjs <video> <case.json> <outDir> [--sheet]
//
// The video is sampled onto a fixed 8fps timeline (phone recordings are variable-frame-rate,
// so seeking by timestamp drifts) with phone chrome cropped off. Each shot's `t` maps to the
// nearest sample. --sheet also writes contact.jpg for choosing shot times: tile n (counting
// left to right, top to bottom from 0) is exactly t = n * 0.25s.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const FPS = 8;
const [video, casePath, outDir] = process.argv.slice(2);
if (!video || !casePath || !outDir) {
  console.error('usage: node src/frames-from-video.mjs <video> <case.json> <outDir> [--sheet]');
  process.exit(1);
}

const kase = JSON.parse(readFileSync(casePath, 'utf8'));
const { top = 0, bottom = 0 } = kase.crop ?? {};
const samples = join(outDir, '.samples');
rmSync(samples, { recursive: true, force: true });
mkdirSync(samples, { recursive: true });

execFileSync(ffmpeg, [
  '-v', 'error', '-i', video,
  '-vf', `fps=${FPS},crop=iw:ih-${top + bottom}:0:${top}`,
  join(samples, '%04d.png'),
]);
const frames = readdirSync(samples).sort();
const at = (i) => join(samples, frames[Math.min(Math.max(i, 0), frames.length - 1)]);

for (const shot of kase.shots) {
  if (shot.t == null) continue;
  const i = Math.round(shot.t * FPS);
  copyFileSync(at(i), join(outDir, `${shot.id}.png`));
  console.log(`${shot.id.padEnd(16)} t=${shot.t}s  <- sample ${i}`);
}

if (process.argv.includes('--sheet')) {
  // Every other sample, 12 per row: tile n (0-based) is at t = n / (FPS / 2) seconds.
  execFileSync(ffmpeg, [
    '-v', 'error', '-y', '-i', join(samples, '%04d.png'),
    '-vf', `select='not(mod(n\\,2))',scale=200:-1,tile=12x5`, '-frames:v', '1',
    join(outDir, 'contact.jpg'),
  ]);
  console.log(`contact sheet: ${join(outDir, 'contact.jpg')} (tile n = ${2 / FPS}s * n)`);
}
rmSync(samples, { recursive: true, force: true });
