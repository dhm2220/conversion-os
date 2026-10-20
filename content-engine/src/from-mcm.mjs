// MCM Private Care family stories -> carousels, in MCM's locked look (Inter only, navy + gold).
//
//   node src/from-mcm.mjs [slug ...]        (no slug = every full-post case)
//
// Reads source/mcm/mcm-cases.json, an export of mcm-live's LOCKED case data
// (app/case-studies/_lib/posts.ts + cases.ts, verbatim from MCM's Drive sources). Nothing is
// written here: every line on a slide is a field from that data. Visuals are only MCM's approved
// photos (mcm-live/public/case-studies); a beat without a fitting photo is MCM's locked text-only
// case-study card. Writes cases/mcm-<slug>.json; build with build.mjs.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(process.env.HOME, '0hr-work/mcm-live/public');
const { posts, cards } = JSON.parse(readFileSync(join(root, 'source/mcm/mcm-cases.json'), 'utf8'));

// Which approved photo goes where. Beats map to the photo that shows that part of the story.
const PHOTOS = {
  'complex-dementia-care-marmerstein': {
    cover: '/case-studies/marmerstein/hero-stan-speaking.jpg',
    beats: ['/case-studies/marmerstein/quote-stan-listening.jpg', '/case-studies/marmerstein/portrait-stan-composed.jpg', null, null, '/case-studies/marmerstein/poster-dan.jpg'],
  },
  'parkinsons-care-filderman': { cover: '/case-studies/filderman/card-phyllis.jpg', beats: [] },
  'dementia-care-karen-w': { cover: '/case-studies/karen-w/card-karen.jpg', beats: ['/case-studies/karen-w/poster.jpg'] },
  'companion-care-sari-r': { cover: '/case-studies/sari-r/card-sari.jpg', beats: [] },
};
// The first sentence of a beat's body, cut at the sentence end (the words are untouched).
// The beat's line: its first sentence long enough to carry the beat (>= 45 characters), cut at
// the sentence end. The words are the body's own, untouched.
const firstSentence = (s) => {
  const parts = s.match(/[^.!?]+[.!?]+["”]?(?=\s|$)/g) ?? [s];
  return (parts.find((x) => x.trim().length >= 45) ?? parts[0]).trim();
};

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(posts);
for (const slug of slugs) {
  const p = posts[slug];
  const card = cards.find((c) => c.slug === slug);
  if (!p || !card) { console.error(`skip ${slug}: no post/card`); continue; }
  const id = `mcm-${slug}`;
  const dir = join(root, 'source', id);
  mkdirSync(dir, { recursive: true });
  const shots = [];
  const shot = (name, sitePath) => {
    if (!sitePath || !existsSync(join(pub, sitePath))) return null;
    const dest = join(dir, `${name}${sitePath.slice(sitePath.lastIndexOf('.'))}`);
    copyFileSync(join(pub, sitePath), dest);
    shots.push({ id: name, src: `../source/${id}/${basename(dest)}` });
    return name;
  };
  const ph = PHOTOS[slug] ?? { beats: [] };
  const cover = shot('cover', ph.cover);
  const stat = (s) => `${s.value} · ${s.label}`;

  const carousel = [
    { type: 'hookEng', eyebrow: 'Family Story', title: card.headline, stats: card.stats, ...(cover ? { marquee: cover, textBottom: true } : {}) },
    {
      type: 'ba', icon: 'shift', kicker: 'What changed', title: card.name,
      beforeLabel: p.changed.before.label, afterLabel: p.changed.withMcm.label,
      before: [...p.changed.before.lines, ...p.changed.before.stats.map(stat)],
      after: [...p.changed.withMcm.lines, ...p.changed.withMcm.stats.map(stat)],
    },
    ...p.beats.map((b, n, all) => ({
      type: 'deck', kicker: `${p.whyHeading} · ${String(n + 1).padStart(2, '0')} / ${String(all.length).padStart(2, '0')}`,
      title: b.heading, text: firstSentence(b.body), image: shot(`beat-${n + 1}`, ph.beats[n]),
    })),
    { type: 'quote', text: p.anchor.quote, by: p.anchor.attribution },
    { type: 'cta', title: p.ctaPrompt },
  ];

  const kase = {
    id,
    url: `https://mcmprivatecare.com/case-studies/${slug}`,
    ownBrand: true,
    palette: 'mcm',
    brand: { name: 'MCM', sub: 'Private Care', bg: '#1B2A4A', text: '#ffffff', muted: 'rgba(255,255,255,0.62)', accentA: '#C4963C', accentB: '#d4ad5e', logo: '../source/mcm/mcm-logo-white.png' },
    source: `mcm-live app/case-studies/_lib/posts.ts + cases.ts (locked, verbatim). Photos: mcm-live/public/case-studies.`,
    industry: 'Home Care',
    headline: card.headline,
    krs: card.stats.map((s) => ({ value: s.value, label: s.label })),
    ctaDomain: 'mcmprivatecare.com',
    context: [],
    cta: { button: 'Call MCM at 240-789-4890', finalButton: 'Call MCM at 240-789-4890' },
    shots,
    carousel,
  };
  writeFileSync(join(root, 'cases', `${id}.json`), JSON.stringify(kase, null, 2) + '\n');
  console.log(`cases/${id}.json: ${carousel.map((s) => s.type).join(' · ')} (${shots.length} photos)`);
}
