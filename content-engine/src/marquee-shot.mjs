// Screenshot the site's own 3D marquee (components/ui/3d-marquee.tsx, live at /showcase/marquee)
// filled with one case's tiles, so a slide can carry the real component instead of a redraw.
//
//   node src/marquee-shot.mjs <out.png> <tile url> [<tile url> ...]
//
// Tiles are dealt so a tile never touches a copy of itself: the wall is 4 columns x 8 and slot
// (column c, row r) takes tile (2r + 5c) mod n, which differs from every neighbor for n >= 8. The page's own headline is hidden; the frame is sized to a slide's hero area.
import { chromium } from 'playwright';

const [out, ...tiles] = process.argv.slice(2);
if (!out || !tiles.length) {
  console.error('usage: node src/marquee-shot.mjs <out.png> <tile url> [...]');
  process.exit(1);
}
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 2 });
await p.goto('https://0hr.app/showcase/marquee', { waitUntil: 'networkidle', timeout: 60_000 });
const box = await p.evaluate(async (tiles) => {
  const imgs = [...document.querySelectorAll('img[data-tdm-src]')];
  const per = Math.ceil(imgs.length / 4);
  imgs.forEach((img, n) => {
    const c = Math.floor(n / per), r = n % per;
    img.src = tiles[(2 * r + 5 * c) % tiles.length];
    img.dataset.tdmSrc = img.src;
  });
  await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  // Only the wall: hide the page heading, stop the drift, and size the frame for a 4:5 slide hero.
  for (const el of document.querySelectorAll('main > :not(:last-child)')) el.style.display = 'none';
  for (const el of document.querySelectorAll('body *')) {
    const pos = getComputedStyle(el).position;
    if ((pos === 'fixed' || pos === 'sticky') && !el.contains(imgs[0])) el.style.visibility = 'hidden';
  }
  const style = document.createElement('style');
  style.textContent = '.tdm-col-a,.tdm-col-b{animation:none!important}';
  document.head.append(style);
  const wall = imgs[0].closest('.overflow-hidden');
  wall.style.height = '760px';
  wall.style.width = '1000px';
  wall.parentElement.style.background = 'transparent';
  wall.parentElement.style.boxShadow = 'none';
  wall.parentElement.style.padding = '0';
  wall.scrollIntoView();
  const r = wall.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}, tiles);
await p.waitForTimeout(600);
await p.screenshot({ path: out, clip: box });
await b.close();
console.log(`marquee (${tiles.length} tiles) -> ${out}`);
