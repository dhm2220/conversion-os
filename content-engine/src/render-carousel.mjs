// Render the stacked carousel + story maps for one case study.
//
//   node src/render-carousel.mjs <case.json> <shotsDir> <outDir>
//
// shotsDir holds <shot id>.png files (from frames-from-video.mjs). Writes one PNG per
// slide plus the HTML it was rendered from, so copy can be tweaked and re-rendered.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { build } from './templates/stack.mjs';

const [casePath, shotsDir, outDir] = process.argv.slice(2);
if (!casePath || !shotsDir || !outDir) {
  console.error('usage: node src/render-carousel.mjs <case.json> <shotsDir> <outDir>');
  process.exit(1);
}

const kase = JSON.parse(readFileSync(casePath, 'utf8'));
const img = (id) => pathToFileURL(resolve(shotsDir, `${id}.png`)).href;
const fontsCss = new URL('../fonts/fonts.css', import.meta.url).href;
mkdirSync(outDir, { recursive: true });

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
