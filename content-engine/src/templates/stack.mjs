// "Stack" templates: instead of one idea per slide, every slide stacks several real screens
// from the source page, so each swipe shows what comes next on the page (first-person POV).
//
// Formats
//   carousel slides  1080x1350 (4:5)  cover / chapter / cta
//   story map        1080x1920 (9:16) the whole page as a 4x3 grid of screens
//   feed map         1080x1350 (4:5)  the whole page as a 5x2 grid of screens

const esc = (s = '') =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Wrap the money/time figures in a headline in the brand gradient.
const accent = (s) =>
  esc(s).replace(/(\$[\d.,]+[KMB]?\+?|\d+\s(?:Days?|days?|Months?))/g, '<span class="grad">$1</span>');

const CSS = /* css */ `
:root {
  --bg: #07070c;
  --panel: #12121c;
  --line: rgba(255, 255, 255, 0.12);
  --text: #f4f4f8;
  --muted: #8b8ba3;
  --accent-a: #5b5bff;
  --accent-b: #ec1f80;
  --grad: linear-gradient(90deg, var(--accent-a), var(--accent-b));
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #000; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: var(--text); }
.slide {
  position: relative; overflow: hidden; background: var(--bg);
  display: flex; flex-direction: column;
}
.slide::before { /* brand glow */
  content: ''; position: absolute; inset: auto -20% -35% -20%; height: 75%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-b) 22%, transparent), transparent),
              radial-gradient(closest-side at 30% 60%, color-mix(in srgb, var(--accent-a) 25%, transparent), transparent);
  filter: blur(20px); pointer-events: none;
}
.feed { width: 1080px; height: 1350px; }
.story { width: 1080px; height: 1920px; }

.top { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 56px 72px 0; }
.brand { font-weight: 800; letter-spacing: 0.04em; font-size: 26px; }
.brand span { font-weight: 400; color: var(--muted); }
.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.18em; font-size: 22px; color: var(--muted); }
.count { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; color: var(--muted); }
.count b { color: var(--text); font-weight: 600; }

.head { position: relative; padding: 40px 72px 0; }
.kicker { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; }
.kicker .n { background: var(--grad); -webkit-background-clip: text; color: transparent; font-weight: 700; margin-right: 14px; }
h1 { font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; }
.feed h1 { font-size: 70px; }
.chapter h1 { font-size: 60px; max-width: 940px; }
.grad { background: var(--grad); -webkit-background-clip: text; color: transparent; }

/* phone screen */
.phone {
  position: relative; border-radius: 34px; overflow: hidden; background: #000;
  border: 2px solid var(--line);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 8px rgba(255, 255, 255, 0.03), 0 0 60px color-mix(in srgb, var(--accent-a) 18%, transparent);
}
.phone img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }

/* cover: three screens fanned out, bleeding off the bottom edge */
.krs { position: relative; display: flex; gap: 18px; padding: 36px 72px 0; }
.kr { flex: 1; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.03); border-radius: 22px; padding: 22px 24px; }
.kr .v { font-size: 46px; font-weight: 800; letter-spacing: -0.02em; }
.kr .l { margin-top: 6px; font-size: 20px; color: var(--muted); }
.fan { position: relative; flex: 1; }
.cover .foot { margin-top: -180px; padding-top: 140px; background: linear-gradient(transparent, var(--bg) 55%); }
.fan .phone { position: absolute; width: 360px; height: 705px; }
.fan .p0 { left: 70px;  top: 110px; transform: rotate(-7deg); }
.fan .p1 { left: 360px; top: 50px;  z-index: 2; }
.fan .p2 { left: 650px; top: 110px; transform: rotate(7deg); }

/* chapter: three consecutive screens, stepping down like a scroll */
.row { position: relative; flex: 1; display: flex; justify-content: center; gap: 28px; padding: 48px 32px 0; }
.step { width: 330px; display: flex; flex-direction: column; align-items: flex-start; }
.step:nth-child(2) { margin-top: 50px; }
.step:nth-child(3) { margin-top: 100px; }
.step .phone { width: 330px; height: 647px; }
.label { margin-top: 22px; display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 700; }
.dot { width: 34px; height: 34px; border-radius: 50%; background: var(--grad); display: grid; place-items: center; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: #fff; flex: none; }

.foot { position: relative; z-index: 5; display: flex; justify-content: space-between; align-items: center; padding: 0 72px 52px; }
.swipe { font-size: 24px; color: var(--muted); }
.swipe b { color: var(--text); }
.bar { width: 220px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--grad); }
.btn { display: inline-flex; align-items: center; gap: 14px; padding: 22px 34px; border-radius: 16px; background: var(--grad); font-size: 26px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; box-shadow: 0 10px 40px color-mix(in srgb, var(--accent-b) 35%, transparent); }

/* maps: the whole page in one image */
.grid { position: relative; display: grid; gap: 16px; padding: 36px 40px 0; }
.story .grid { grid-template-columns: repeat(4, 1fr); }
.feed .grid { grid-template-columns: repeat(5, 1fr); gap: 14px; }
.grid .phone { border-radius: 18px; aspect-ratio: 888 / 1740; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55); }
.grid .phone .n { position: absolute; left: 10px; bottom: 10px; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 700; padding: 4px 8px; border-radius: 8px; background: rgba(7, 7, 12, 0.8); border: 1px solid var(--line); }
.story h1 { font-size: 68px; }
.map-feed h1 { font-size: 60px; }
.map-feed .krs { padding: 30px 40px 0; }
.map-feed .kr { padding: 18px 22px; }
.map-feed .kr .v { font-size: 40px; }
`;

const top = (kase, i, total) => `
  <div class="top">
    <div class="brand">${brandMark(kase)}</div>
    <div class="count"><b>${String(i + 1).padStart(2, '0')}</b> / ${String(total).padStart(2, '0')}</div>
  </div>`;

const foot = (i, total, left) => `
  <div class="foot">
    <div class="swipe">${left}</div>
    <div class="bar"><i style="width:${((i + 1) / total) * 100}%"></i></div>
  </div>`;

const phone = (src, extra = '') => `<div class="phone ${extra}"><img src="${src}"></div>`;

function cover(kase, slide, i, total, img) {
  return `
<section class="slide feed cover">
  ${top(kase, i, total)}
  <div class="head">
    <div class="kicker mono">Case study · ${esc(kase.industry)}</div>
    <h1>${accent(kase.headline)}</h1>
  </div>
  <div class="krs">
    ${kase.krs.map((k) => `<div class="kr"><div class="v grad">${esc(k.value)}</div><div class="l">${esc(k.label)}</div></div>`).join('')}
  </div>
  <div class="fan">${slide.shots.map((id, n) => phone(img(id), `p${n}`)).join('')}</div>
  ${foot(i, total, '<b>Swipe →</b> the whole case study, screen by screen')}
</section>`;
}

function chapter(kase, slide, i, total, img) {
  const isCta = slide.type === 'cta';
  return `
<section class="slide feed chapter">
  ${top(kase, i, total)}
  <div class="head">
    <div class="kicker mono"><span class="n">●</span>${esc(slide.kicker)}</div>
    <h1>${accent(slide.title)}</h1>
  </div>
  <div class="row">
    ${slide.shots
      .map((s, n) => `<div class="step">${phone(img(s.id))}<div class="label"><span class="dot">${n + 1}</span>${esc(s.label)}</div></div>`)
      .join('')}
  </div>
  ${isCta
    ? `<div class="foot"><div class="btn">Read the full story →</div><div class="mono">${esc(kase.ctaDomain)}</div></div>`
    : foot(i, total, '<b>Swipe →</b> what happens next')}
</section>`;
}

function map(kase, ids, img, format) {
  const story = format === 'story';
  return `
<section class="slide ${story ? 'story' : 'feed map-feed'}">
  <div class="top">
    <div class="brand">${brandMark(kase)}</div>
    <div class="mono">Case study · ${esc(kase.industry)}</div>
  </div>
  <div class="head">
    <div class="kicker mono"><span class="n">${ids.length}</span>screens · the full story</div>
    <h1>${accent(kase.headline)}</h1>
  </div>
  <div class="grid">
    ${ids.map((id, n) => `<div class="phone"><img src="${img(id)}"><span class="n">${String(n + 1).padStart(2, '0')}</span></div>`).join('')}
  </div>
  ${story ? '' : `<div class="krs">${kase.krs.map((k) => `<div class="kr"><div class="v grad">${esc(k.value)}</div><div class="l">${esc(k.label)}</div></div>`).join('')}</div>`}
  <div style="flex:1"></div>
  <div class="foot">
    <div class="swipe"><b>Read the full case study</b> → ${esc(kase.ctaDomain)}</div>
    <div class="bar"><i style="width:100%"></i></div>
  </div>
</section>`;
}

// Brand defaults are Different Hunger's. A case file's "brand" (or the colors capture-url
// reads off the live page) overrides them: name, sub, bg, text, muted, accentA, accentB.
const DH = { name: 'DIFFERENT', sub: 'HUNGER', bg: '#07070c', text: '#f4f4f8', muted: '#8b8ba3', accentA: '#5b5bff', accentB: '#ec1f80' };
const brandOf = (kase) => ({ ...DH, ...kase.brand });
const brandMark = (kase) => {
  const b = brandOf(kase);
  return `${esc(b.name)}${b.sub ? ` <span>${esc(b.sub)}</span>` : ''}`;
};
const brandVars = (kase) => {
  const b = brandOf(kase);
  return `:root { --bg: ${b.bg}; --text: ${b.text}; --muted: ${b.muted}; --accent-a: ${b.accentA}; --accent-b: ${b.accentB};
  --panel: color-mix(in srgb, ${b.text} 5%, ${b.bg}); --line: color-mix(in srgb, ${b.text} 12%, transparent); }`;
};

const doc = (kase, body, fontsCss) => `<!doctype html><html><head><meta charset="utf-8">
<link href="${fontsCss}" rel="stylesheet">
<style>${CSS}${brandVars(kase)}</style></head><body>${body}</body></html>`;

// Returns [{ name, html }] — one HTML document per output image.
// img(id) -> URL of a shot; fontsCss -> URL of fonts/fonts.css.
export function build(kase, img, fontsCss) {
  const total = kase.carousel.length;
  const slides = kase.carousel.map((slide, i) => ({
    name: `carousel-${String(i + 1).padStart(2, '0')}-${slide.type}`,
    html: doc(kase, slide.type === 'cover' ? cover(kase, slide, i, total, img) : chapter(kase, slide, i, total, img), fontsCss),
  }));
  return [
    ...slides,
    { name: 'map-story-9x16', html: doc(kase, map(kase, kase.storyMap, img, 'story'), fontsCss) },
    { name: 'map-feed-4x5', html: doc(kase, map(kase, kase.storyMap.slice(0, 10), img, 'feed'), fontsCss) },
  ];
}
