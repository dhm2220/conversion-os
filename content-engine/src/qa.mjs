// QA gate: a carousel only passes when nothing on it was made up.
//
//   node src/qa.mjs cases/<id>.json        exit 1 on any FAIL
//
// FAIL  a slide line that is not, word for word, in the case's sources
// FAIL  an image that is missing, blank, or a near-solid fill (a broken crop)
// FAIL  more than 6 objects on one slide (mk's rule: max 6 objects per screen)
// FAIL  the same image used on two slides
// WARN  a published claim that our own source check contested (shown, never hidden)
//
// Sources per case (all files, never typed by hand here):
//   growth (from-page)   source/<id>/source.txt  the live page's own text
//   engineering (draft)  the draft.json + the spec (published tile title, deck transcriptions)
//   MCM                  source/mcm/mcm-cases.json (MCM's locked case data)
// Template chrome (section labels, button labels) is listed in CHROME below.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const casePath = process.argv[2];
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kase = JSON.parse(readFileSync(casePath, 'utf8'));
const home = (p) => p.replace(/^~(?=\/)/, process.env.HOME);

// Words the templates themselves own: section names, button labels, the CTA line every DH page ends on.
const CHROME = [
  'The transformation', 'Business - Problem - Solution', 'Business', 'Problem', 'Solution', 'Social proof',
  'What we built', 'Bonus content', 'Free content upgrade', 'Free gift', 'The timeline', 'Campaign Results',
  'What changed', 'Family Story', 'Before', 'After', 'The work', 'START NOW', 'GET INSTANT ACCESS',
  'Ready to Be the Next Success Story?', 'Call MCM at 240-789-4890', 'Deploy Tech Stack',
];
// Published claims our own evidence check contested (case-study-gen package.md). Shown as WARN.
const CONTESTED = ['$11.9M', '$100K+/mo', '$100,000/month', '16 new inbound leads', 'Entire in-house team replaced'];

const norm = (s) => String(s ?? '')
  .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ')
  .replace(/…/g, '...').replace(/\s+/g, ' ').trim().toLowerCase();

// ---- the case's source corpus
let corpus = CHROME.join('\n');
const add = (x) => { corpus += '\n' + (typeof x === 'string' ? x : JSON.stringify(x)); };
const pageTxt = join(root, 'source', kase.id, 'source.txt');
if (existsSync(pageTxt)) add(readFileSync(pageTxt, 'utf8'));
const spec = join(root, 'specs', `${kase.id}.json`);
if (existsSync(spec)) {
  const sp = JSON.parse(readFileSync(spec, 'utf8'));
  add({ title: sp.title, deck: sp.deckSlides });
  if (sp.draft && existsSync(home(sp.draft))) add(readFileSync(home(sp.draft), 'utf8'));
}
if (kase.id.startsWith('mcm-')) add(readFileSync(join(root, 'source/mcm/mcm-cases.json'), 'utf8'));
// The live page's own data file (quotes in hidden carousel slides, audience fields).
// (Ansel's file keeps its template name, example-ansel.json.)
for (const f of [`${kase.id}.json`, `example-${kase.id}.json`]) {
  const pageData = join(process.env.HOME, '0-hr/apps/portal/app/case-studies/_data', f);
  if (existsSync(pageData)) add(readFileSync(pageData, 'utf8'));
}
// The case-study template's own section title, "<Client>’s Transformation", is chrome.
const client = existsSync(spec) && JSON.parse(readFileSync(spec, 'utf8')).draft ? JSON.parse(readFileSync(home(JSON.parse(readFileSync(spec, 'utf8')).draft), 'utf8')).client : null;
if (client) add(`${client}’s Transformation`);
// JSON escapes (\" ’) would hide matches, so decode string literals back to text.
corpus = norm(corpus.replace(/\{\{|\}\}/g, '').replace(/\\"/g, '"').replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))));

// ---- every line on every slide
const lines = [];
const line = (slide, field, text) => { if (text && String(text).trim()) lines.push({ slide, field, text: String(text) }); };
kase.carousel.forEach((s, i) => {
  const n = i + 1;
  ['title', 'oneLiner', 'text', 'sub', 'by'].forEach((f) => line(n, f, s[f]));
  if (s.type === 'deck') line(n, 'eyebrow', s.kicker?.replace(/\s·\s\d+\s\/\s\d+$/, ''));
  (s.blocks ?? []).forEach((b) => line(n, 'block', b.text));
  (s.quotes ?? []).forEach((q) => { line(n, 'quote', q.text.replace(/^“|”$/g, '')); line(n, 'quote by', q.name); });
  (s.before ?? []).concat(s.after ?? []).forEach((x) => x.split(' · ').forEach((part) => line(n, 'before/after', part)));
  (s.steps ?? []).forEach((st) => { line(n, 'step', st.title); (st.items ?? []).forEach((x) => line(n, 'step item', x)); line(n, 'caption', st.caption); });
  (s.rows ?? []).forEach((r) => { line(n, 'item', r.title); line(n, 'why', r.why); });
  (s.milestones ?? []).forEach((m) => { line(n, 'when', m.when); line(n, 'milestone', m.title); });
  (s.cards ?? []).forEach((c) => { line(n, 'stat', c.value); line(n, 'stat title', c.title); line(n, 'stat sub', c.sub); });
  (s.stats ?? []).forEach((c) => { line(n, 'stat', c.value); line(n, 'stat label', c.label); });
});
line(0, 'gift', kase.cta?.gift);

const results = [];
const fail = (what, detail) => results.push({ level: 'FAIL', what, detail });
const warn = (what, detail) => results.push({ level: 'WARN', what, detail });

// 1. word for word
for (const l of lines) {
  // "12+" stands for the source's "more than 12": the number must be there.
  const t = norm(l.text).replace(/[.:]$/, '').replace(/^(\d[\d,.]*)\+$/, '$1');
  if (!corpus.includes(t)) fail('copy not in source', `slide ${l.slide} ${l.field}: "${l.text}"`);
}
// 2. contested claims
for (const l of lines) for (const c of CONTESTED) if (l.text.includes(c)) warn('contested claim (published, shown as is)', `slide ${l.slide}: ${c}`);

// 3. images: present, not blank, not reused
const shotSrc = (id) => {
  const s = kase.shots?.find((x) => x.id === id);
  if (s?.src) return resolve(dirname(casePath), s.src);
  return join(root, 'output', kase.id, 'shots', `${id}.png`);
};
const used = new Map();
kase.carousel.forEach((s, i) => {
  const ids = [s.headline, s.image, s.marquee, ...(s.images ?? []), ...(s.stats ?? []).filter((x) => typeof x === 'string'),
    ...(s.steps ?? []).map((x) => x.image), ...(s.rows ?? []).map((x) => x.image), ...(s.quotes ?? []).map((q) => q.avatar)].filter(Boolean);
  for (const id of ids) {
    const f = shotSrc(id);
    if (!existsSync(f)) { fail('image missing', `slide ${i + 1}: ${id}`); continue; }
    // 16x16 grey thumbnail: a near-zero spread means a blank or solid-fill crop.
    const px = execFileSync(ffmpeg, ['-v', 'error', '-i', f, '-vf', 'scale=16:16,format=gray', '-f', 'rawvideo', '-']);
    const mean = px.reduce((a, b) => a + b, 0) / px.length;
    const sd = Math.sqrt(px.reduce((a, b) => a + (b - mean) ** 2, 0) / px.length);
    if (sd < 6) fail('image blank or solid', `slide ${i + 1}: ${id} (spread ${sd.toFixed(1)})`);
    const h = createHash('sha1').update(readFileSync(f)).digest('hex');
    // Quote avatars repeat by design (one person, several quotes).
    if (used.has(h) && !(s.quotes ?? []).some((q) => q.avatar === id)) fail('image used twice', `slide ${i + 1}: ${id} = slide ${used.get(h)}`);
    else if (!used.has(h)) used.set(h, i + 1);
  }
});

// 4. max 6 objects per slide
kase.carousel.forEach((s, i) => {
  const count = { wall: s.cards?.length, built: s.steps?.length, deep: s.rows?.length, context: s.blocks?.length, proof: s.quotes?.length, hook: (s.stats?.length ?? 0) + 1, data: s.cards?.length }[s.type];
  if (count > 6) fail('more than 6 objects', `slide ${i + 1} (${s.type}): ${count}`);
});

const fails = results.filter((r) => r.level === 'FAIL');
writeFileSync(join(root, 'output', kase.id, 'qa.json'), JSON.stringify({ case: kase.id, lines: lines.length, results }, null, 2) + '\n');
for (const r of results) console.log(`${r.level}  ${r.what}  ${r.detail}`);
console.log(`${kase.id}: ${lines.length} lines checked · ${fails.length} fail · ${results.length - fails.length} warn → ${fails.length ? 'BLOCKED' : 'PASS'}`);
process.exit(fails.length ? 1 : 0);
