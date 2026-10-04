// Case study templates. The page itself is the content: carousel slides put real sections of
// the case study page straight onto the canvas (no device frames), in the order the story is
// told, so each swipe shows what comes next on the page.
//
// Carousel structure (every case): hook (hero stat + freebie) -> before/after -> problem/
// solution -> social proof -> what we built (1-2 slides) -> content upgrade tease -> final CTA.
//
// Formats
//   carousel slides  1080x1350 (4:5)  hook / section / tease / final
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
.grad { background: var(--grad); -webkit-background-clip: text; color: transparent; }

/* carousel: page sections on the canvas. Images blend with "lighten" so the page's own
   near-black background disappears into the slide and only its content shows. */
.kick { position: relative; padding: 28px 64px 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
.kick::before { content: '●'; margin-right: 14px; background: var(--grad); -webkit-background-clip: text; color: transparent; }
.media { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; padding: 24px 48px; }
.media figure { flex: 1 1 0; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; }
.media img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: lighten; border-radius: 24px; }
.foot { position: relative; z-index: 5; display: flex; justify-content: space-between; align-items: center; padding: 0 64px 48px; }
.swipe { font-size: 24px; color: var(--muted); }
.swipe b { color: var(--text); }
.bar { width: 220px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--grad); }
.btn { display: inline-flex; align-items: center; gap: 14px; padding: 26px 40px; border-radius: 18px; background: var(--grad); font-size: 30px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; box-shadow: 0 10px 40px color-mix(in srgb, var(--accent-b) 35%, transparent); }

/* hook: the page's own headline, a context pill, the hero stat, and the freebie */
.hook .headline { position: relative; display: block; width: 960px; margin: 28px auto 0; mix-blend-mode: lighten; }
.pill { position: relative; align-self: center; display: flex; gap: 26px; margin-top: 18px; padding: 14px 28px; border: 1px solid var(--line); border-radius: 999px; background: var(--panel); font-size: 22px; color: var(--muted); }
.pill b { color: var(--text); font-weight: 600; }
.gift { position: relative; display: flex; align-items: center; gap: 24px; margin: 0 48px 28px; padding: 24px 28px; border-radius: 22px;
  background: linear-gradient(var(--panel), var(--panel)) padding-box, var(--grad) border-box; border: 2px solid transparent; }
.gift svg { flex: none; }
.gift .what { flex: 1; font-size: 25px; line-height: 1.3; font-weight: 700; }
.gift .what small { display: block; font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
.dm { flex: none; padding: 16px 22px; border-radius: 14px; background: var(--grad); font-size: 22px; font-weight: 800; letter-spacing: 0.04em; white-space: nowrap; }

/* tease: the content upgrade, faded out before it gives everything away */
.tease h1 { position: relative; padding: 18px 64px 0; font-size: 56px; }
.tease .media img { -webkit-mask-image: linear-gradient(#000 45%, transparent 92%); mask-image: linear-gradient(#000 45%, transparent 92%); }
.unlock { position: relative; align-self: center; margin: -40px 0 36px; }

/* final: one call to action, the page's own words */
.final .body { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 64px; gap: 40px; }
.final h1 { font-size: 92px; }
.final .krs { padding: 0; }
.final .go { display: flex; align-items: center; gap: 32px; }
.final .go .mono { font-size: 26px; }

/* phone screens (maps) */
.phone { position: relative; overflow: hidden; background: #000; }
.phone img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
.krs { position: relative; display: flex; gap: 18px; padding: 36px 72px 0; }
.kr { flex: 1; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.03); border-radius: 22px; padding: 22px 24px; }
.kr .v { font-size: 46px; font-weight: 800; letter-spacing: -0.02em; }
.kr .l { margin-top: 6px; font-size: 20px; color: var(--muted); }

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

const GIFT = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="url(#g)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="var(--accent-a)"/><stop offset="1" stop-color="var(--accent-b)"/></linearGradient></defs><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>`;

const dm = (kase) => `<div class="dm">DM “${esc(kase.cta.keyword)}”</div>`;
const media = (slide, img) =>
  `<div class="media">${slide.images.map((id) => `<figure><img src="${img(id)}"></figure>`).join('')}</div>`;

function hook(kase, slide, i, total, img) {
  return `
<section class="slide feed hook">
  ${top(kase, i, total)}
  <img class="headline" src="${img(slide.headline)}">
  <div class="pill">${kase.context.map((c) => `<span>${esc(c.label)} <b>${esc(c.value)}</b></span>`).join('')}</div>
  ${media(slide, img)}
  <div class="gift">${GIFT}<div class="what"><small>Free gift</small>${esc(kase.cta.gift)}</div>${dm(kase)}</div>
  ${foot(i, total, '<b>Swipe →</b> the whole case study')}
</section>`;
}

function section(kase, slide, i, total, img) {
  return `
<section class="slide feed section">
  ${top(kase, i, total)}
  <div class="kick">${esc(slide.kicker)}</div>
  ${media(slide, img)}
  ${foot(i, total, '<b>Swipe →</b> what happens next')}
</section>`;
}

function tease(kase, slide, i, total, img) {
  return `
<section class="slide feed tease">
  ${top(kase, i, total)}
  <div class="kick">${esc(slide.kicker)}</div>
  <h1>${accent(slide.title)}</h1>
  ${media(slide, img)}
  <div class="unlock">${dm(kase)}</div>
  ${foot(i, total, '<b>Swipe →</b> one last thing')}
</section>`;
}

function final(kase, slide, i, total) {
  return `
<section class="slide feed final">
  ${top(kase, i, total)}
  <div class="body">
    <h1>${accent(slide.title)}</h1>
    <div class="krs">${kase.krs.map((k) => `<div class="kr"><div class="v grad">${esc(k.value)}</div><div class="l">${esc(k.label)}</div></div>`).join('')}</div>
    <div class="go"><div class="btn">${esc(slide.button)} →</div><div class="mono">${esc(kase.ctaDomain)}</div></div>
  </div>
</section>`;
}

const SLIDES = { hook, section, tease, final };

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
    html: doc(kase, SLIDES[slide.type](kase, slide, i, total, img), fontsCss),
  }));
  if (!kase.storyMap?.length) return slides;
  return [
    ...slides,
    { name: 'map-story-9x16', html: doc(kase, map(kase, kase.storyMap, img, 'story'), fontsCss) },
    { name: 'map-feed-4x5', html: doc(kase, map(kase, kase.storyMap.slice(0, 10), img, 'feed'), fontsCss) },
  ];
}
