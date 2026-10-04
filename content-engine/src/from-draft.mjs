// Engineering variant: make a case file from a short-form case study DRAFT (no live page yet)
// plus its long-form playbook, for build cases (brand, website, product UX) where the story is
// the work itself, not leads and pipeline.
//
//   node src/from-draft.mjs specs/<id>.json
//
// The spec names the draft (the case-study generator's draft.json: every string in it is traced
// to a source), the public folder its image paths resolve against, the playbook URL, and which
// playbook images go on which slide. Slide copy comes from the draft and the spec's title (the
// case's published tile title), word for word. Story-map screens are the playbook page itself.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const specPath = process.argv[2];
if (!specPath) {
  console.error('usage: node src/from-draft.mjs specs/<id>.json');
  process.exit(1);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = (p) => p.replace(/^~(?=\/)/, process.env.HOME);
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const { id } = spec;
const d = JSON.parse(readFileSync(home(spec.draft), 'utf8'));
const srcDir = join(root, 'source', id);
mkdirSync(srcDir, { recursive: true });

const shots = [];
// Copy one image into source/<id>/ and register it as a shot. `from` is a site path (/x.jpg,
// resolved against spec.publicDir) or a file under source/<id>/.
function shot(name, from) {
  const file = from.startsWith('/') ? join(home(spec.publicDir), from) : join(srcDir, from);
  if (!existsSync(file)) throw new Error(`missing image for ${name}: ${file}`);
  const dest = join(srcDir, `${name}${file.slice(file.lastIndexOf('.'))}`);
  if (resolve(file) !== resolve(dest)) copyFileSync(file, dest);
  shots.push({ id: name, src: `../source/${id}/${basename(dest)}` });
  return name;
}

const block = (key) => d.blocks.find((b) => b.key === key) ?? {};
const strip = (s) => s.replace(/\{\{|\}\}/g, '');
const facts = d.facts.map(([label, value]) => ({ label, value }));

// Stat cards, drawn from the draft's highlight cards (the same numbers the page will show).
const cards = d.highlights.map((h) => {
  if (h.type === 'days')
    return { value: String(h.days), title: strip(h.title).replace(/^Days|^Weeks/, h.unit === 'weeks' ? 'Weeks' : 'Days'), viz: 'progress', from: h.startLabel, to: h.endLabel };
  if (h.type === 'breakdown')
    return { value: h.metric, title: strip(h.title), viz: 'bars', rows: h.parts.map((p) => ({ label: p.label, n: p.value })) };
  if (h.type === 'growth') return { value: h.end.display, title: strip(h.title), viz: 'line', from: h.start.label, to: h.end.label };
  return null;
}).filter(Boolean);

const points = (side) => (d.transformation?.[side]?.points ?? []).map((p) => p.body);
const solution = block('solution');
const steps = (solution.timeline ?? []).map((t) =>
  t.stack ? { title: t.title, stack: t.stack.map((s) => ({ name: s.name, role: s.role })) } : { title: t.title, items: t.items ?? [] },
);
const quotes = [...(block('problem').quotes ?? []), ...(block('results').quotes ?? [])].map((q, n) => {
  const [name, ...role] = q.author.split(',').map((s) => s.trim());
  return { logo: d.client, text: `“${q.text}”`, name, role: role.join(', '), avatar: q.avatar ? shot(`avatar-${n + 1}`, q.avatar) : null };
}).filter((q) => q.avatar);

const work = (spec.work ?? []).map((group, g) => ({ ...group, images: group.images.map((f, n) => shot(`work-${g + 1}-${n + 1}`, f)) }));
const cover = spec.cover ? shot('cover', spec.cover) : null;

const carousel = [
  // A spec "marquee" (made by marquee-shot.mjs from the site's 3D marquee) replaces the stat cards:
  // the hook shows the work, not the data.
  spec.marquee
    ? { type: 'hookEng', title: spec.title, marquee: shot('marquee', spec.marquee), scope: d.scope ?? [] }
    : { type: 'hookEng', title: spec.title, cards: cards.slice(0, 2), image: cover, scope: d.scope ?? [] },
  spec.transformImage
    ? { type: 'section', icon: 'shift', kicker: 'The transformation', images: [shot('transformation', spec.transformImage)] }
    : { type: 'ba', icon: 'shift', kicker: 'The transformation', title: `${d.client}’s Transformation`, before: points('before'), after: points('after') },
  { type: 'context', icon: 'info', kicker: 'Business - Problem - Solution', blocks: [
    { icon: 'persona', title: 'Business', text: block('context').body ?? d.standfirst },
    { icon: 'warning', title: 'Problem', text: block('problem').body },
    { icon: 'bulb', title: 'Solution', text: solution.body },
  ].filter((b) => b.text) },
  steps.length && { type: 'built', icon: 'build', kicker: 'What we built', steps: steps.slice(0, 6) },
  ...work.map((w) => ({ type: 'section', icon: 'image', kicker: w.kicker ?? 'The work', images: w.images, row: !!w.row })),
  quotes.length && { type: 'proof', icon: 'quote', kicker: 'Social proof', quotes: quotes.slice(0, 2) },
  { type: 'cta', title: spec.ctaTitle ?? 'Ready to Be the Next Success Story?' },
].filter(Boolean);

// Story map: capture the playbook as phone screens, then take 12 evenly from the article body
// (the last fifth is "Keep Reading" and the footer).
const shotsDir = join(root, 'output', id, 'shots');
execFileSync(process.execPath, [join(root, 'src', 'capture-url.mjs'), spec.playbook, specPath, shotsDir], { stdio: 'inherit' });
const count = readdirSync(join(shotsDir, 'screens')).filter((f) => f.endsWith('.png')).length;
const usable = Math.max(1, Math.floor(count * 0.8));
const n = Math.min(12, usable);
const pick = [...new Set(Array.from({ length: n }, (_, k) => 1 + Math.round((k * (usable - 1)) / Math.max(1, n - 1))))];
const mapShots = pick.map((screen) => ({ id: `screen-${String(screen).padStart(2, '0')}`, screen }));

const kase = {
  id,
  variant: 'engineering',
  // Enough real deliverables to show: black/white slides, the work carries the color.
  palette: spec.palette ?? (work.reduce((n, w) => n + w.images.length, 0) + (cover ? 1 : 0) >= 3 ? 'mono' : 'brand'),
  url: spec.playbook,
  ownBrand: true,
  brand: { bg: '#08090b', logo: '../source/brand/dh-logo-dark.png', displayFont: '../source/brand/blanc-bold.woff2' },
  source: `Draft ${spec.draft} (source-traced) · playbook ${spec.playbook} · title = published tile title.`,
  industry: facts.find((f) => f.label === 'Industry')?.value ?? '',
  headline: spec.title,
  krs: [],
  ctaDomain: 'differenthunger.com',
  context: facts,
  cta: { button: 'START NOW', finalButton: 'START NOW' },
  shots: [...mapShots, ...shots],
  carousel,
  storyMap: mapShots.map((s) => s.id),
};
writeFileSync(join(root, 'cases', `${id}.json`), JSON.stringify(kase, null, 2) + '\n');
console.log(`cases/${id}.json: ${carousel.map((s) => s.type).join(' · ')} · ${mapShots.length} map screens`);
