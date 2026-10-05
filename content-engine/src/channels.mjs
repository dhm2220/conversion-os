// Channel packs: every passing case, sized and captioned for every channel, ready to queue.
//
//   node src/channels.mjs <id> [<id> ...]      → export/<id>/
//
//   instagram-facebook/   4:5 slides (IG/FB carousel, max 20)
//   linkedin/<id>.pdf     the same slides as a LinkedIn document carousel
//   stories-reels-tiktok/ each slide on a 9:16 canvas (Stories, TikTok photo mode, Shorts stills)
//   x/                    the first 4 slides (X's image limit)
//   pinterest/            the 9:16 story map as a pin
//   captions.md / .json   per channel, built ONLY from the case's own verbatim fields
//                         (headline, standfirst, bonus line, link); alt text = each slide's own title
//
// Captions are assembled, never written: a field with no source is left out, not filled in.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = (p) => p.replace(/^~(?=\/)/, process.env.HOME);
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
const mcm = readJson(join(root, 'source/mcm/mcm-cases.json'));

// The case's own words for captions, by where the case comes from.
function sourceFields(id, kase) {
  if (id.startsWith('mcm-')) {
    const slug = id.slice(4), p = mcm.posts[slug], c = mcm.cards.find((x) => x.slug === slug);
    return { headline: c.headline, standfirst: p.standfirst, extra: [p.ctaPrompt, 'Call MCM at 240-789-4890'], url: `https://mcmprivatecare.com/case-studies/${slug}` };
  }
  const spec = readJson(join(root, 'specs', `${id}.json`));
  if (spec?.draft) {
    const d = readJson(home(spec.draft));
    return { headline: spec.title, standfirst: d.standfirst, extra: [], url: spec.playbook };
  }
  const page = readJson(join(process.env.HOME, '0-hr/apps/portal/app/case-studies/_data', `${id}.json`))
    ?? readJson(join(process.env.HOME, '0-hr/apps/portal/app/case-studies/_data', `example-${id}.json`));
  // The live case study page these slides come from, on our own brand domain.
  return { headline: page?.headline ?? kase.headline, standfirst: page?.standfirst, extra: [kase.cta?.gift].filter(Boolean), url: `https://differenthunger.app/case-studies/${id}` };
}

const browser = await chromium.launch();
for (const id of process.argv.slice(2)) {
  const kase = JSON.parse(readFileSync(join(root, 'cases', `${id}.json`), 'utf8'));
  const qa = readJson(join(root, 'output', id, 'qa.json'));
  if (qa?.results?.some((r) => r.level === 'FAIL')) { console.log(`skip ${id}: QA gate failed`); continue; }
  const out = join(root, 'output', id), dest = join(root, 'export', id);
  rmSync(dest, { recursive: true, force: true });
  const slides = readdirSync(out).filter((f) => /^carousel-.*\.png$/.test(f)).sort();
  const dir = (n) => { const d = join(dest, n); mkdirSync(d, { recursive: true }); return d; };
  const jpg = (src, to) => execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', src, '--out', to], { stdio: 'ignore' });

  // 4:5 carousel (IG / FB) and X's first four
  const ig = dir('instagram-facebook'), x = dir('x');
  slides.forEach((f, n) => {
    const name = `${String(n + 1).padStart(2, '0')}.jpg`;
    jpg(join(out, f), join(ig, name));
    if (n < 4) copyFileSync(join(ig, name), join(x, name));
  });
  // 9:16: the slide centred on a blurred, darkened copy of itself
  const st = dir('stories-reels-tiktok');
  slides.forEach((f, n) => execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', join(out, f), '-filter_complex',
    '[0]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:2,eq=brightness=-0.18[bg];[bg][0]overlay=(W-w)/2:(H-h)/2',
    '-q:v', '3', join(st, `${String(n + 1).padStart(2, '0')}.jpg`)]));
  // Pinterest: the 9:16 story map, when the case has one
  if (existsSync(join(out, 'map-story-9x16.png'))) jpg(join(out, 'map-story-9x16.png'), join(dir('pinterest'), 'pin-9x16.jpg'));
  // LinkedIn document carousel: one PDF page per slide
  const li = dir('linkedin');
  const page = await browser.newPage();
  const imgs = slides.map((f) => `<img src="${pathToFileURL(join(out, f)).href}">`).join('');
  await page.setContent(`<html><head><style>@page{size:1080px 1350px;margin:0}body{margin:0}img{display:block;width:1080px;height:1350px;page-break-after:always}</style></head><body>${imgs}</body></html>`, { waitUntil: 'load' });
  await page.pdf({ path: join(li, `${id}.pdf`), width: '1080px', height: '1350px', printBackground: true });
  await page.close();

  // Captions: the case's own fields only
  const f = sourceFields(id, kase);
  const body = [f.headline, f.standfirst, ...f.extra].filter(Boolean);
  const long = [...body, f.url].filter(Boolean).join('\n\n');
  const alt = kase.carousel.map((s, n) => `${String(n + 1).padStart(2, '0')}. ${s.title ?? s.kicker ?? kase.headline}`);
  const captions = {
    sources: 'headline, standfirst, bonus/CTA lines and link, word for word from the case data; no other text',
    instagram: [...body].join('\n\n') + (f.url ? '\n\nLink in bio.' : ''),
    facebook: long, linkedin: long,
    x: [f.headline, f.url].filter(Boolean).join('\n\n'),
    tiktok: f.headline, pinterest: { title: f.headline, description: f.standfirst ?? '', link: f.url },
    alt,
  };
  // "Link in bio." is the one line not from the case: Instagram can't link in captions.
  writeFileSync(join(dest, 'captions.json'), JSON.stringify(captions, null, 2) + '\n');
  writeFileSync(join(dest, 'captions.md'), [`# ${f.headline}`, `Sources: ${captions.sources}.`,
    '## Instagram', captions.instagram, '## Facebook', captions.facebook, '## LinkedIn (with linkedin/' + id + '.pdf)', captions.linkedin,
    '## X (with x/01–04)', captions.x, '## TikTok / Reels / Shorts (with stories-reels-tiktok/)', captions.tiktok,
    '## Pinterest (pinterest/pin-9x16.jpg)', `Title: ${captions.pinterest.title}\nDescription: ${captions.pinterest.description}\nLink: ${captions.pinterest.link ?? ''}`,
    '## Alt text per slide', alt.join('\n')].join('\n\n') + '\n');
  console.log(`${id}: ${slides.length} slides → IG/FB · LinkedIn PDF · 9:16 · X · ${existsSync(join(out, 'map-story-9x16.png')) ? 'Pinterest · ' : ''}captions`);
}
await browser.close();
