// Capture a live page as phone screens, the URL-in alternative to a scroll recording.
//
//   node src/capture-url.mjs <url> <case.json> <outDir> [--sheet]
//
// Loads the page on a phone-sized viewport (444x870 CSS px at 2x = 888x1740, the same size
// as cropped recording frames), scrolls through once so lazy images and on-scroll animations
// fire, then screenshots one screen every STEP of the viewport height into screens/NN.png.
// Each shot in case.json picks a screen: { "id": "hero", "screen": 1 }. --sheet writes
// contact.jpg with every screen in order (tile n = screen n + 1). It also reads the page's
// own colors into brand.json (background, text, main button color) so slides match the site.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { chromium, devices } from 'playwright';

const VIEWPORT = { width: 444, height: 870 };
const STEP = 0.8; // overlap screens a little so no section is cut in half everywhere
const SETTLE_MS = 700; // let counters/charts finish animating before each screenshot

const [url, casePath, outDir] = process.argv.slice(2);
if (!url || !casePath || !outDir) {
  console.error('usage: node src/capture-url.mjs <url> <case.json> <outDir> [--sheet]');
  process.exit(1);
}

const kase = JSON.parse(readFileSync(casePath, 'utf8'));
const screensDir = join(outDir, 'screens');
rmSync(screensDir, { recursive: true, force: true });
mkdirSync(screensDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['iPhone 14 Pro Max'],
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

// First pass: walk down the page so lazy content loads and scroll animations play once.
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});

// The site's own palette: page background, body text, and the most common button color.
const brand = await page.evaluate(() => {
  const solid = (c) => c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c);
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  const counts = {};
  for (const el of document.querySelectorAll('a, button')) {
    const c = getComputedStyle(el).backgroundColor;
    if (solid(c) && el.offsetWidth > 60) counts[c] = (counts[c] ?? 0) + 1;
  }
  const accent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const text = getComputedStyle(document.querySelector('h1') ?? document.body).color;
  return {
    bg: solid(bodyBg) ? bodyBg : solid(htmlBg) ? htmlBg : '#ffffff',
    text,
    muted: `color-mix(in srgb, ${text} 60%, transparent)`,
    ...(accent && { accentA: accent, accentB: accent }),
  };
});
writeFileSync(join(outDir, 'brand.json'), JSON.stringify(brand, null, 2) + '\n');

const height = await page.evaluate(() => document.documentElement.scrollHeight);
const stride = Math.round(VIEWPORT.height * STEP);
let n = 0;
for (let y = 0; y < height; y += stride) {
  n += 1;
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(SETTLE_MS);
  await page.screenshot({ path: join(screensDir, `${String(n).padStart(2, '0')}.png`) });
  if (y + VIEWPORT.height >= height) break;
}
await browser.close();
console.log(`${n} screens from ${url}`);

for (const shot of kase.shots ?? []) {
  if (shot.screen == null) continue;
  copyFileSync(join(screensDir, `${String(shot.screen).padStart(2, '0')}.png`), join(outDir, `${shot.id}.png`));
  console.log(`${shot.id.padEnd(16)} <- screen ${shot.screen}`);
}

if (process.argv.includes('--sheet')) {
  execFileSync(ffmpeg, [
    '-v', 'error', '-y', '-pattern_type', 'glob', '-i', join(screensDir, '*.png'),
    '-vf', `scale=200:-1,tile=8x${Math.ceil(n / 8)}`, '-frames:v', '1', join(outDir, 'contact.jpg'),
  ]);
  console.log(`contact sheet: ${join(outDir, 'contact.jpg')} (tile n = screen n + 1)`);
}
