// Render the stacked carousel + story maps for one case study.
//
//   node src/render-carousel.mjs <case.json> <shotsDir> <outDir>
//
// shotsDir holds <shot id>.png files (from frames-from-video.mjs). Writes one PNG per
// slide plus the HTML it was rendered from, so copy can be tweaked and re-rendered.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { build } from './templates/stack.mjs';

const [casePath, shotsDir, outDir] = process.argv.slice(2);
if (!casePath || !shotsDir || !outDir) {
  console.error('usage: node src/render-carousel.mjs <case.json> <shotsDir> <outDir>');
  process.exit(1);
}

const kase = JSON.parse(readFileSync(casePath, 'utf8'));
// A shot is either a frame/screen pulled into shotsDir (<id>.png) or an image file given in
// the case as "src" (relative to the case file), e.g. a section cropped from the page.
const img = (id) => {
  const src = kase.shots.find((s) => s.id === id)?.src;
  return pathToFileURL(src ? resolve(dirname(casePath), src) : resolve(shotsDir, `${id}.png`)).href;
};
const fontsCss = new URL('../fonts/fonts.css', import.meta.url).href;
mkdirSync(outDir, { recursive: true });
// Clear the last render so slides dropped from the case don't linger.
for (const f of readdirSync(outDir)) if (/^(carousel|map)-.*\.(png|html)$/.test(f)) rmSync(join(outDir, f));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
for (const { name, html } of build(kase, img, fontsCss)) {
  const htmlPath = resolve(outDir, `${name}.html`);
  writeFileSync(htmlPath, html);
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.slide').screenshot({ path: join(outDir, `${name}.png`) });
  console.log(`${name}.png`);
}
await browser.close();
