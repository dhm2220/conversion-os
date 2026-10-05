// Make a case file straight from a live short-form case study page, no hand-picking.
//
//   node src/from-page.mjs <url> [id]
//
// Every case study page is rendered from the same template, so each section is found by its
// place in that template and cropped as an element screenshot into source/<id>/. All copy on
// the slides is read off the page word for word (headline, pill, before/after, problem,
// solution, quotes, bonus lines, final CTA). Nothing is written here: a slide whose source
// isn't on the page is left out. Writes cases/<id>.json, then run build.mjs on it.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const [url, idArg] = process.argv.slice(2);
if (!url) {
  console.error('usage: node src/from-page.mjs <url> [id]');
  process.exit(1);
}
const id = idArg ?? new URL(url).pathname.split('/').filter(Boolean).pop();
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'source', id);
rmSync(srcDir, { recursive: true, force: true });
mkdirSync(srcDir, { recursive: true });

// Same viewport as capture-url.mjs, so crops and story-map screens match in scale.
const VIEWPORT = { width: 444, height: 870 };
const STRIDE = Math.round(VIEWPORT.height * 0.8);

const browser = await chromium.launch();
const page = await (await browser.newContext({ ...devices['iPhone 14 Pro Max'], viewport: VIEWPORT, deviceScaleFactor: 2, colorScheme: 'dark' })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
// Walk the page once so lazy images load and the scroll-lit timelines finish lighting up.
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 250) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
});
await page.waitForTimeout(800);
// Fixed/sticky bars (nav, chat bubble) would sit over whatever is being cropped.
await page.evaluate(() => {
  for (const el of document.querySelectorAll('body *')) {
    const pos = getComputedStyle(el).position;
    // Only bars and bubbles; a full-screen fixed layer is the page's backdrop (the dark sky) and stays.
    const big = el.getBoundingClientRect().height > window.innerHeight * 0.6;
    if ((pos === 'fixed' || pos === 'sticky') && !big) el.style.setProperty('visibility', 'hidden', 'important');
  }
});

const text = (loc) => loc.first().innerText().then((t) => t.replace(/\s+/g, ' ').trim()).catch(() => '');
const shots = [];
// Crop one element to source/<id>/<name>.png. Returns the shot id, or null if it isn't there.
// maxAspect caps height/width, keeping the top of a very tall element (it'd shrink to nothing).
async function crop(name, loc, maxAspect) {
  const el = loc.first();
  if (!(await el.count()) || !(await el.isVisible())) return null;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const file = join(srcDir, `${name}.png`);
  const box = await el.boundingBox();
  if (maxAspect && box.height > box.width * maxAspect) {
    // Bring the element's top to the top of the screen and clip inside the viewport: a full-page
    // capture would only paint the fixed backdrop (the dark sky) behind the first screen.
    await el.evaluate((n) => n.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(400);
    const b = await el.boundingBox();
    await page.screenshot({ path: file, animations: 'disabled', clip: { x: b.x, y: b.y, width: b.width, height: Math.min(b.width * maxAspect, VIEWPORT.height - b.y) } });
  } else await el.screenshot({ path: file, animations: 'disabled' });
  shots.push({ id: name, src: `../source/${id}/${name}.png` });
  return name;
}

const sections = page.locator('main section, body section');
const hero = sections.nth(0);
const headline = (await text(hero.locator('h1'))).replace(/\s+/g, ' ');

// Pill: "Industry: X Location: Y Type: Z Employees: N" -> [{label, value}]
const pillRow = await text(hero.locator('dl').first());
const scope = (await text(hero.locator('dl').nth(1))).replace(/^Scope:\s*/, '').split('·').map((x) => x.trim()).filter(Boolean);
const context = [...pillRow.matchAll(/([A-Z][a-z]+):\s*(.+?)(?=\s+[A-Z][a-z]+:|$)/g)].map((m) => ({ label: m[1], value: m[2].trim() }));

// Hero stat cards, the bonus bar under them.
const statCards = hero.locator('div.grid > div');
const stats = [];
for (let n = 0; n < Math.min(await statCards.count(), 3); n++) stats.push(await crop(`stat-${n + 1}`, statCards.nth(n)));
const headlineShot = await crop('headline', hero.locator('h1'));
const bonusBar = hero.locator('div.rounded-\\[1\\.8rem\\]').last();
const giftShort = (await text(bonusBar)).replace(/^BONUS CONTENT\s*/i, '').replace(/\s*GET INSTANT ACCESS$/i, '');
const buttonLabel = await text(bonusBar.locator('button'));

// Before / after.
const transformation = await crop('transformation', sections.nth(1));

// Problem + solution copy, word for word.
const problem = sections.nth(2);
const about = await text(problem.locator('h3:has-text("About") + p'));
const challenge = await text(problem.locator('h3:has-text("Challenge") + p'));
const solution = sections.nth(3);
const solutionBody = await text(solution.locator('h2 + p'));

// Quotes: one from Problem, one from Results, with the avatar shown beside each on the page.
const quotes = [];
for (const [n, sec] of [[1, problem], [2, sections.nth(4)]]) {
  const fig = sec.locator('figure:has(blockquote)').first();
  if (!(await fig.count())) continue;
  const q = await text(fig.locator('blockquote'));
  const who = await text(fig.locator('figcaption span.text-sm'));
  const avatar = await crop(`avatar-${n}`, fig.locator('figcaption img'));
  const [name, ...role] = who.split(',').map((s) => s.trim());
  if (q && avatar) quotes.push({ logo: role.at(-1) ?? name, text: q, name, role: role.join(', '), avatar });
}

// What we built: the four timeline steps under Solution, each step's visual cropped.
const steps = [];
const stepRows = solution.locator('div.relative.max-w-7xl > div.flex');
for (let n = 0; n < (await stepRows.count()); n++) {
  const row = stepRows.nth(n);
  const title = (await text(row.locator('h3'))).replace(/^\d+\.\s*/, '');
  const body = row.locator('div.space-y-6').first();
  const shot = (await body.count()) && (await body.innerText()).trim() ? await crop(`built-${n + 1}`, body.locator('> *').first(), 1.1) : null;
  if (shot) steps.push({ title, image: shot });
}

// Bonus section near the end: its headline is the long version of the offer.
const bonusSection = page.locator('section:has-text("BONUS CONTENT")').last();
const giftLong = await text(bonusSection.locator('h3'));
const deliverables = steps.find((s) => /deliverable/i.test(s.title))?.image;

// Final CTA section.
const finalSec = page.locator('section:has(h2:has-text("Next Success Story"))').last();
const finalTitle = await text(finalSec.locator('h2'));
const finalButton = await text(finalSec.locator('a, button'));

// Story map: evenly spaced phone screens from the top of the page to the end of Results
// (stops before "More Success Stories"), matching the screens capture-url.mjs takes.
const endY = await page.evaluate(() => {
  const more = [...document.querySelectorAll('section')].find((s) => /More Success Stories/.test(s.innerText));
  return more ? more.getBoundingClientRect().top + window.scrollY : document.documentElement.scrollHeight;
});
// The page's own text, saved as this case's source: the QA gate checks every slide line against it.
writeFileSync(join(srcDir, 'source.txt'), await page.evaluate(() => document.body.innerText));
await browser.close();
const usable = Math.max(1, Math.floor(endY / STRIDE));
const pick = Array.from({ length: Math.min(12, usable) }, (_, n) => 1 + Math.round((n * (usable - 1)) / Math.max(1, Math.min(12, usable) - 1)));
const mapShots = [...new Set(pick)].map((screen) => ({ id: `screen-${String(screen).padStart(2, '0')}`, screen }));

const blocks = [
  about && { icon: 'persona', title: 'Business', text: about },
  challenge && { icon: 'warning', title: 'Problem', text: challenge },
  solutionBody && { icon: 'bulb', title: 'Solution', text: solutionBody },
].filter(Boolean);

// Slides only go in when their source is on the page.
const carousel = [
  headlineShot && stats.filter(Boolean).length && { type: 'hook', headline: headlineShot, stats: stats.filter(Boolean) },
  transformation && { type: 'section', icon: 'shift', kicker: 'The transformation', images: [transformation] },
  blocks.length && { type: 'context', icon: 'info', kicker: 'Business - Problem - Solution', blocks },
  quotes.length && { type: 'proof', icon: 'quote', kicker: 'Social proof', quotes },
  steps.length && { type: 'built', icon: 'build', kicker: 'What we built', steps: steps.slice(0, 4) },
  // The bonus doc already shows in What we built, so the tease is the offer line and its button.
  giftLong && { type: 'tease', icon: 'gift', kicker: 'Bonus content', title: giftLong, images: [] },
  finalTitle && { type: 'cta', title: finalTitle },
].filter(Boolean);

const kase = {
  id,
  url,
  // Our own case study pages render in the Different Hunger brand, like cases/steelcon.json.
  ...(/(^|\.)(0hr\.app|differenthunger\.com)$/.test(new URL(url).hostname) && {
    ownBrand: true,
    brand: { bg: '#08090b', logo: '../source/brand/dh-logo-dark.png', displayFont: '../source/brand/blanc-bold.woff2', displayFontLight: '../source/brand/blanc-ultralight.woff2' },
  }),
  source: `Live page ${url}, captured ${new Date().toISOString().slice(0, 10)}. All slide copy is the page's own text.`,
  industry: context.find((c) => c.label === 'Industry')?.value ?? '',
  headline,
  krs: [],
  // Links point at our own brand domain, never 0hr.app.
  ctaDomain: /0hr\.app$/.test(new URL(url).hostname) ? 'differenthunger.com' : new URL(url).hostname,
  context,
  scope,
  // No comment/DM keyword is on the page, so buttons carry the page's own labels.
  cta: { gift: giftShort, button: buttonLabel || 'GET INSTANT ACCESS', finalButton: finalButton || 'START NOW' },
  shots: [...mapShots, ...shots],
  carousel,
  storyMap: mapShots.map((s) => s.id),
};
writeFileSync(join(root, 'cases', `${id}.json`), JSON.stringify(kase, null, 2) + '\n');
console.log(`cases/${id}.json: ${carousel.map((s) => s.type).join(' · ')} · ${mapShots.length} map screens`);
