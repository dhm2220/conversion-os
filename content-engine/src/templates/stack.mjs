// Case study templates. The page itself is the content: carousel slides put real sections of
// the case study page straight onto the canvas (no device frames), in the order the story is
// told, so each swipe shows what comes next on the page.
//
// Carousel structure (every case): hook (hero stats + freebie) -> before/after -> problem/
// solution -> social proof -> what we built -> content upgrade tease -> the numbers + CTA.
//
// Formats
//   carousel slides  1080x1350 (4:5)  hook / section / context / proof / built / tease / data
//   story map        1080x1920 (9:16) the whole page as a 4x3 grid of screens
//   feed map         1080x1350 (4:5)  the whole page as a 5x2 grid of screens
//
// Site parts reused as-is: the nav CTA button (Different Hunger Navbar), the boxed testimonial
// card (block/testimonials-marquee-grid-boxed.tsx), the Blanc display font and the DH logo.

const esc = (s = '') =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Wrap the money/time figures in a headline in the brand gradient.
const accent = (s) =>
  esc(s).replace(/(\$[\d.,]+[KMB]?\+?|\d+\s(?:Days?|days?|Months?))/g, '<span class="grad">$1</span>');

// Line icons (24px grid, stroked), one per kind of section.
const ICONS = {
  persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17v.01"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
  shift: '<path d="M3 7h14l-4-4M21 17H7l4 4"/>',
  quote: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
  build: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
};
const icon = (name, size = 30) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const CSS = /* css */ `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #000; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: var(--text); }
.slide { position: relative; overflow: hidden; background: var(--bg); display: flex; flex-direction: column; }
.slide::before { /* brand glow */
  content: ''; position: absolute; inset: auto -20% -35% -20%; height: 75%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-b) 20%, transparent), transparent),
              radial-gradient(closest-side at 30% 60%, color-mix(in srgb, var(--accent-a) 22%, transparent), transparent);
  filter: blur(20px); pointer-events: none;
}
.feed { width: 1080px; height: 1350px; }
.story { width: 1080px; height: 1920px; }
.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.18em; font-size: 22px; color: var(--muted); }
.grad { background: var(--grad); -webkit-background-clip: text; color: transparent; }
h1 { font-family: var(--display); font-weight: 700; letter-spacing: -0.02em; line-height: 1.04; text-wrap: balance; }

.top { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 52px 64px 0; }
.brand { font-weight: 800; letter-spacing: 0.04em; font-size: 26px; }
.brand span { font-weight: 400; color: var(--muted); }
.brand img { display: block; height: 40px; width: auto; }
.count { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; color: var(--muted); }
.count b { color: var(--text); font-weight: 600; }

/* section header: an icon badge + the section's name */
.kick { position: relative; display: flex; align-items: center; gap: 18px; padding: 30px 64px 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
.badge { flex: none; display: grid; place-items: center; width: 60px; height: 60px; border-radius: 16px; color: var(--text);
  background: linear-gradient(var(--panel), var(--panel)) padding-box, var(--grad) border-box; border: 2px solid transparent; }

/* the site's nav CTA button, static (gloss + scanlines, no shimmer) */
.dhbtn { position: relative; display: inline-flex; align-items: center; gap: 14px; padding: 20px 30px; border-radius: 12px; overflow: hidden; isolation: isolate; white-space: nowrap;
  font-family: var(--display); font-weight: 700; font-size: 24px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255, 240, 248, 0.95);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, transparent 50%), linear-gradient(90deg, var(--accent-a) 0%, var(--accent-b) 100%);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--accent-a) 30%, transparent), 0 0 34px color-mix(in srgb, var(--accent-b) 22%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(0, 0, 0, 0.18); }
.dhbtn::after { content: ''; position: absolute; inset: 0; z-index: -1; background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.18) 0 1px, transparent 1px 3px); mix-blend-mode: multiply; opacity: 0.55; }

.foot { position: relative; z-index: 5; display: flex; justify-content: space-between; align-items: center; padding: 0 64px 48px; }
.swipe { font-size: 24px; color: var(--muted); }
.swipe b { color: var(--text); }
.bar { width: 220px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--grad); }

/* page crops on the canvas. "lighten" lets the page's near-black background vanish into the slide */
.media { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; padding: 24px 48px; }
.media figure { flex: 1 1 0; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; }
.media img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: lighten; border-radius: 24px; }

/* hook */
.hook .headline { position: relative; display: block; width: 960px; margin: 26px auto 0; mix-blend-mode: lighten; border-radius: 24px; }
.pill { position: relative; align-self: center; display: flex; gap: 26px; margin-top: 18px; padding: 14px 28px; border: 1px solid var(--line); border-radius: 999px; background: var(--panel); font-size: 22px; color: var(--muted); }
.pill b { color: var(--text); font-weight: 600; }
.stats { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: 1.1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; padding: 26px 48px; }
.stats figure { min-height: 0; overflow: hidden; border-radius: 26px; }
.stats figure:nth-child(3) { grid-column: 2; grid-row: 1 / 3; display: flex; align-items: center; }
.stats img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; mix-blend-mode: lighten; }
.stats figure:nth-child(3) img { height: auto; }
.gift { position: relative; display: flex; align-items: center; gap: 22px; margin: 0 48px 26px; padding: 22px 24px; border-radius: 22px;
  background: linear-gradient(var(--panel), var(--panel)) padding-box, var(--grad) border-box; border: 2px solid transparent; }
.gift > svg { flex: none; color: var(--accent-b); }
.gift .what { flex: 1; font-size: 25px; line-height: 1.3; font-weight: 700; }
.gift .what small { display: block; font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
.gift .dhbtn { font-size: 19px; padding: 16px 20px; letter-spacing: 0.1em; }

/* context: the page's problem / solution copy, one icon per section */
.blocks { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 30px; padding: 24px 64px; }
.block { display: flex; gap: 26px; padding: 30px 32px; border: 1px solid var(--line); border-radius: 26px; background: var(--panel); }
.block .badge { width: 64px; height: 64px; }
.block h2 { font-family: var(--display); font-size: 38px; letter-spacing: -0.01em; margin-bottom: 12px; }
.block p { font-size: 26px; line-height: 1.5; color: color-mix(in srgb, var(--text) 78%, transparent); }
.block.warn .badge { color: #ffb020; }

/* proof: boxed testimonial cards, the same anatomy as testimonials-marquee-grid-boxed */
.quotes { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 28px; padding: 24px 64px; }
.tcard { padding: 40px 42px; border: 1px solid var(--line); border-radius: 22px; background: var(--panel); }
.tcard .logo { display: inline-block; padding: 8px 14px; border-radius: 8px; background: var(--text); color: var(--bg); font-weight: 800; font-size: 20px; letter-spacing: 0.02em; }
.tcard blockquote { margin: 26px 0 30px; font-size: 38px; line-height: 1.38; font-weight: 500; }
.tcard .who { display: flex; align-items: center; gap: 18px; }
.tcard .who img { width: 68px; height: 68px; border-radius: 12px; object-fit: cover; border: 1px solid var(--line); }
.tcard .who b { display: block; font-size: 24px; }
.tcard .who span { font-size: 20px; color: var(--muted); }

/* built: the page's four build steps, each with its own visual */
.steps { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; padding: 24px 48px; }
.step { min-height: 0; display: flex; flex-direction: column; gap: 14px; padding: 24px; border: 1px solid var(--line); border-radius: 24px; background: var(--panel); }
.step h2 { font-family: var(--display); font-size: 30px; line-height: 1.15; }
.step h2 span { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 500; margin-right: 10px; }
.step figure { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.step img { display: block; max-width: 100%; max-height: 100%; min-height: 0; object-fit: contain; mix-blend-mode: lighten; border-radius: 14px; }
.step figcaption { font-family: var(--display); font-size: 22px; text-align: center; }

/* tease */
.tease h1 { position: relative; padding: 22px 64px 0; font-size: 56px; }
.tease .media img { -webkit-mask-image: linear-gradient(#000 45%, transparent 92%); mask-image: linear-gradient(#000 45%, transparent 92%); }
.unlock { position: relative; align-self: center; margin: -40px 0 36px; }

/* data: every number from the case, drawn */
.data h1 { position: relative; padding: 22px 64px 0; font-size: 60px; }
.data .wrap { position: relative; flex: 1; display: flex; flex-direction: column; gap: 22px; padding: 26px 64px 0; }
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tile { padding: 20px 22px; border: 1px solid var(--line); border-radius: 20px; background: var(--panel); }
.tile .v { font-family: var(--display); font-size: 50px; line-height: 1; }
.tile .l { margin-top: 10px; font-size: 19px; color: var(--muted); }
.panel { padding: 22px 26px; border: 1px solid var(--line); border-radius: 20px; background: var(--panel); }
.panel h3 { font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
.funnel { display: grid; gap: 10px; }
.frow { display: grid; grid-template-columns: 150px 1fr 150px; align-items: center; gap: 16px; font-size: 21px; }
.frow .track { height: 26px; }
.frow .fill { height: 100%; min-width: 6px; border-radius: 0 6px 6px 0; background: var(--accent-a); }
.frow .n { font-family: var(--display); font-size: 26px; text-align: right; }
.frow .n small { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 17px; color: var(--muted); margin-left: 8px; }
.bench { display: grid; gap: 14px; }
.brow { display: grid; grid-template-columns: 250px 1fr 84px; align-items: center; gap: 16px; font-size: 20px; }
.brow .track { position: relative; height: 22px; border-radius: 0 6px 6px 0; background: rgba(255, 255, 255, 0.05); }
.brow .fill { height: 100%; border-radius: 0 6px 6px 0; background: var(--accent-a); }
.brow .tick { position: absolute; top: -6px; bottom: -6px; width: 3px; background: var(--text); border-radius: 2px; }
.brow .n { font-family: var(--display); font-size: 26px; text-align: right; }
.key { display: flex; gap: 24px; margin-top: 14px; font-size: 17px; color: var(--muted); }
.key i { display: inline-block; vertical-align: middle; margin-right: 8px; }
.data .go { display: flex; align-items: center; justify-content: space-between; padding: 26px 64px 48px; position: relative; }
.data .go .mono { font-size: 24px; color: var(--text); letter-spacing: 0.12em; }

/* phone screens (maps) */
.phone { position: relative; overflow: hidden; background: #000; }
.phone img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
.head { position: relative; padding: 40px 72px 0; }
.kicker { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 22px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; }
.kicker .n { background: var(--grad); -webkit-background-clip: text; color: transparent; font-weight: 700; margin-right: 14px; }
.krs { position: relative; display: flex; gap: 18px; padding: 36px 72px 0; }
.kr { flex: 1; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.03); border-radius: 22px; padding: 22px 24px; }
.kr .v { font-size: 46px; font-weight: 800; letter-spacing: -0.02em; }
.kr .l { margin-top: 6px; font-size: 20px; color: var(--muted); }
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

const top = (kase, i, total, asset) => `
  <div class="top">
    <div class="brand">${brandMark(kase, asset)}</div>
    <div class="count"><b>${String(i + 1).padStart(2, '0')}</b> / ${String(total).padStart(2, '0')}</div>
  </div>`;

const foot = (i, total, left) => `
  <div class="foot">
    <div class="swipe">${left}</div>
    <div class="bar"><i style="width:${((i + 1) / total) * 100}%"></i></div>
  </div>`;

const kick = (slide) => `<div class="kick"><span class="badge">${icon(slide.icon)}</span>${esc(slide.kicker)}</div>`;
const cta = (kase) => `<div class="dhbtn">Comment or DM “${esc(kase.cta.keyword)}”</div>`;
const media = (slide, img) =>
  `<div class="media">${slide.images.map((id) => `<figure><img src="${img(id)}"></figure>`).join('')}</div>`;

const SLIDES = {
  hook: (kase, slide, i, total, img, asset) => `
<section class="slide feed hook">
  ${top(kase, i, total, asset)}
  <img class="headline" src="${img(slide.headline)}">
  <div class="pill">${kase.context.map((c) => `<span>${esc(c.label)} <b>${esc(c.value)}</b></span>`).join('')}</div>
  <div class="stats">${slide.stats.map((id) => `<figure><img src="${img(id)}"></figure>`).join('')}</div>
  <div class="gift">${icon('gift', 52)}<div class="what"><small>Free gift</small>${esc(kase.cta.gift)}</div>${cta(kase)}</div>
  ${foot(i, total, '<b>Swipe →</b> the whole case study')}
</section>`,

  section: (kase, slide, i, total, img, asset) => `
<section class="slide feed">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  ${media(slide, img)}
  ${foot(i, total, '<b>Swipe →</b> what happens next')}
</section>`,

  context: (kase, slide, i, total, img, asset) => `
<section class="slide feed">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <div class="blocks">
    ${slide.blocks
      .map((b) => `<div class="block ${b.icon === 'warning' ? 'warn' : ''}"><span class="badge">${icon(b.icon, 32)}</span><div><h2>${esc(b.title)}</h2><p>${esc(b.text)}</p></div></div>`)
      .join('')}
  </div>
  ${foot(i, total, '<b>Swipe →</b> what happens next')}
</section>`,

  proof: (kase, slide, i, total, img, asset) => `
<section class="slide feed">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <div class="quotes">
    ${slide.quotes
      .map((q) => `<div class="tcard"><span class="logo">${esc(q.logo)}</span><blockquote>${esc(q.text)}</blockquote>
        <div class="who"><img src="${img(q.avatar)}"><div><b>${esc(q.name)}</b><span>${esc(q.role)}</span></div></div></div>`)
      .join('')}
  </div>
  ${foot(i, total, '<b>Swipe →</b> what we built')}
</section>`,

  built: (kase, slide, i, total, img, asset) => `
<section class="slide feed">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <div class="steps">
    ${slide.steps
      .map((s, n) => `<div class="step"><h2><span class="grad">${String(n + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>
        <figure><img src="${img(s.image)}">${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}</figure></div>`)
      .join('')}
  </div>
  ${foot(i, total, '<b>Swipe →</b> get the sequence')}
</section>`,

  tease: (kase, slide, i, total, img, asset) => `
<section class="slide feed tease">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <h1>${accent(slide.title)}</h1>
  ${media(slide, img)}
  <div class="unlock">${cta(kase)}</div>
  ${foot(i, total, '<b>Swipe →</b> every number')}
</section>`,

  data: (kase, slide, i, total, img, asset) => {
    const d = slide.data;
    const most = Math.max(...d.funnel.map((f) => f.n));
    return `
<section class="slide feed data">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <h1>${accent(slide.title)}</h1>
  <div class="wrap">
    <div class="tiles">${d.tiles.map((t) => `<div class="tile"><div class="v grad">${esc(t.value)}</div><div class="l">${esc(t.label)}</div></div>`).join('')}</div>
    <div class="panel"><h3>${esc(d.funnelTitle)}</h3><div class="funnel">
      ${d.funnel.map((f) => `<div class="frow"><span>${esc(f.label)}</span><div class="track"><div class="fill" style="width:${(f.n / most) * 100}%"></div></div><span class="n">${f.n.toLocaleString('en-US')}${f.rate ? `<small>${esc(f.rate)}</small>` : ''}</span></div>`).join('')}
    </div></div>
    <div class="panel"><h3>${esc(d.benchTitle)}</h3><div class="bench">
      ${d.bench.map((b) => {
        const max = Math.max(b.actual, b.standard) * 1.15;
        return `<div class="brow"><span>${esc(b.label)}</span><div class="track"><div class="fill" style="width:${(b.actual / max) * 100}%"></div><i class="tick" style="left:${(b.standard / max) * 100}%"></i></div><span class="n">${b.actual}%</span></div>`;
      }).join('')}
      </div>
      <div class="key"><span><i style="width:22px;height:12px;background:var(--accent-a);border-radius:0 3px 3px 0"></i>SteelCon actual</span><span><i style="width:3px;height:20px;background:var(--text)"></i>Industry standard (minimum)</span></div>
    </div>
  </div>
  <div class="go">${cta(kase)}<div class="mono">${esc(kase.ctaDomain)}</div></div>
</section>`;
  },
};

function map(kase, ids, img, format, asset) {
  const story = format === 'story';
  return `
<section class="slide ${story ? 'story' : 'feed map-feed'}">
  <div class="top">
    <div class="brand">${brandMark(kase, asset)}</div>
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

// Brand defaults are Different Hunger's, from the site's own tokens (Different Hunger Navbar):
// #08080a background, #4169E1 -> #FF1493 gradient, Blanc display type. A case file's "brand"
// (or the colors capture-url reads off a live page) overrides them.
const DH = { name: 'DIFFERENT', sub: 'HUNGER', bg: '#08080a', text: '#f4f4f6', muted: '#8e8e99', accentA: '#4169E1', accentB: '#FF1493' };
const brandOf = (kase) => ({ ...DH, ...kase.brand });
const brandMark = (kase, asset) => {
  const b = brandOf(kase);
  if (b.logo) return `<img src="${asset(b.logo)}" alt="${esc(b.name)}">`;
  return `${esc(b.name)}${b.sub ? ` <span>${esc(b.sub)}</span>` : ''}`;
};
const brandCss = (kase, asset) => {
  const b = brandOf(kase);
  const font = b.displayFont ? `@font-face { font-family: 'Brand Display'; font-weight: 700; src: url('${asset(b.displayFont)}') format('woff2'); }` : '';
  return `${font}
:root { --bg: ${b.bg}; --text: ${b.text}; --muted: ${b.muted}; --accent-a: ${b.accentA}; --accent-b: ${b.accentB};
  --grad: linear-gradient(90deg, var(--accent-a), var(--accent-b));
  --panel: color-mix(in srgb, ${b.text} 5%, ${b.bg}); --line: color-mix(in srgb, ${b.text} 12%, transparent);
  --display: ${b.displayFont ? "'Brand Display', " : ''}'Plus Jakarta Sans', system-ui, sans-serif; }`;
};

const doc = (kase, body, fontsCss, asset) => `<!doctype html><html><head><meta charset="utf-8">
<link href="${fontsCss}" rel="stylesheet">
<style>${CSS}${brandCss(kase, asset)}</style></head><body>${body}</body></html>`;

// Returns [{ name, html }], one HTML document per output image.
// img(id) -> URL of a shot; asset(path) -> URL of a brand file; fontsCss -> URL of fonts/fonts.css.
export function build(kase, img, fontsCss, asset) {
  const total = kase.carousel.length;
  const slides = kase.carousel.map((slide, i) => ({
    name: `carousel-${String(i + 1).padStart(2, '0')}-${slide.type}`,
    html: doc(kase, SLIDES[slide.type](kase, slide, i, total, img, asset), fontsCss, asset),
  }));
  if (!kase.storyMap?.length) return slides;
  return [
    ...slides,
    { name: 'map-story-9x16', html: doc(kase, map(kase, kase.storyMap, img, 'story', asset), fontsCss, asset) },
    { name: 'map-feed-4x5', html: doc(kase, map(kase, kase.storyMap.slice(0, 10), img, 'feed', asset), fontsCss, asset) },
  ];
}
