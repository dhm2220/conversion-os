// Case study templates. The page itself is the content: carousel slides put real sections of
// the case study page straight onto the canvas (no device frames), in the order the story is
// told, so each swipe shows what comes next on the page.
//
// Carousel structure (every case): hook (hero stats + freebie) -> before/after -> problem/
// solution -> social proof -> what we built -> content upgrade tease -> stats wall + CTA.
//
// Formats
//   carousel slides  1080x1350 (4:5)  hook / section / context / proof / built / tease / wall
//   story map        1080x1920 (9:16) the whole page as a 4x3 grid of screens
//   feed map         1080x1350 (4:5)  the whole page as a 5x2 grid of screens
//
// Site parts reused as-is: the nav CTA button (Different Hunger Navbar), the boxed testimonial
// card (block/testimonials-marquee-grid-boxed.tsx), the Blanc display font and the DH logo.

const esc = (s = '') =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Wrap the money/time figures in a headline in the brand gradient.
const accent = (s) =>
  esc(s).replace(/(\$[\d.,]+(?:\s(?:million|billion)|[KMB]\+?|\+)?|\d+\s(?:Days?|days?|Months?))/g, '<span class="grad">$1</span>');

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

.top { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 44px 64px 0; min-height: 44px; }
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
.swipe { display: flex; align-items: baseline; gap: 22px; font-size: 24px; color: var(--muted); }
.swipe b { color: var(--text); }
.bar { width: 220px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
.foot .nav { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
.foot .brand img { height: 52px; }
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
.stats figure:nth-child(3) { grid-column: 2; grid-row: 1; }
.stats.no-one figure:nth-child(3) { grid-row: 1 / span 2; }
.stats.no-one figure:nth-child(3) img { object-fit: contain; object-position: center; }
.stats img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: left top; mix-blend-mode: lighten; }
.stats .one { grid-column: 2; grid-row: 2; display: flex; align-items: center; padding: 26px 30px; border-radius: 26px; border: 1px solid var(--line); background: var(--panel);
  font-family: var(--display); font-size: 34px; line-height: 1.2; }
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
.steps.n3 .step:nth-child(3) { grid-column: span 2; }
.steps.n2 { grid-template-rows: 1fr; }
.step h2 { font-family: var(--display); font-size: 30px; line-height: 1.15; }
.step h2 span { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 500; margin-right: 10px; }
.step figure { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.step img { display: block; max-width: 100%; max-height: 100%; min-height: 0; object-fit: contain; mix-blend-mode: lighten; border-radius: 14px; }
.step figcaption { font-family: var(--display); font-size: 22px; text-align: center; }

/* blueprint tile: light, like the Google Slides deck it comes from */
.bp { flex: 1; min-height: 0; display: flex; flex-direction: column; border-radius: 14px; overflow: hidden; background: #fbf7f8; color: #1a1416; }
.bp-tabs { display: flex; background: #f1e3e7; }
.bp-tabs span { flex: 1; padding: 9px 4px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em; color: #8a6b74; }
.bp-tabs span.on { background: var(--accent-b); color: #fff; font-weight: 700; }
.bp-rows { flex: 1; display: flex; flex-direction: column; justify-content: space-around; padding: 6px 14px; }
.bp-rows div { display: grid; grid-template-columns: 112px 1fr; gap: 10px; align-items: baseline; padding: 6px 0; border-bottom: 1px solid #eadde1; }
.bp-rows div:last-child { border-bottom: 0; }
.bp-rows b { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #9b7c85; }
.bp-rows span { font-size: 15.5px; font-weight: 600; line-height: 1.3; }
.step .dhbtn { font-size: 15px; padding: 12px 16px; letter-spacing: 0.08em; }

/* step visuals spaced evenly (thumbnail, caption, CTA) */
.step figure.even { justify-content: space-evenly; }
.step figure.even .dhbtn { font-size: 20px; padding: 18px 24px; letter-spacing: 0.08em; }
/* tech stack tree */
.tstack { list-style: none; flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 4px 0 4px 26px; border-left: 2px solid color-mix(in srgb, var(--text) 30%, transparent); margin-left: 8px; }
.tstack li { position: relative; display: flex; align-items: center; gap: 12px; padding: 7px 12px; border: 1px solid color-mix(in srgb, var(--text) 18%, transparent); border-radius: 12px; background: color-mix(in srgb, var(--text) 6%, transparent); }
.tstack li::before { content: ''; position: absolute; left: -28px; top: 50%; width: 26px; border-top: 2px solid color-mix(in srgb, var(--text) 30%, transparent); }
.tstack .ti { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: var(--grad); font-weight: 800; font-size: 16px; }
.tstack b { display: block; font-size: 17px; }
.tstack span { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }

/* final CTA */
.final .fbody { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 44px; padding: 0 64px; }
.final .fbody h1 { font-size: 88px; }
.final .fbody p { font-size: 32px; line-height: 1.4; color: color-mix(in srgb, var(--text) 78%, transparent); max-width: 900px; }
.final .fbtn .dhbtn { font-size: 34px; padding: 30px 44px; border-radius: 16px; }
.final .fbody .mono { font-size: 24px; color: var(--text); letter-spacing: 0.14em; }

/* tease */
.tease h1 { position: relative; padding: 22px 64px 0; font-size: 56px; }
.tease .media img { -webkit-mask-image: linear-gradient(#000 45%, transparent 92%); mask-image: linear-gradient(#000 45%, transparent 92%); }
.unlock { position: relative; align-self: flex-start; margin: 34px 64px 0; }
.unlock .dhbtn { font-size: 34px; padding: 30px 44px; border-radius: 16px; }

/* wall: full-bleed bento of stat cards in the page's own card style (big gradient number,
   a title with the time frame, a small chart drawn from the case numbers) */
.wall .grid4 { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 16px; padding: 22px 32px 16px; }
.card { position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 22px 26px; border-radius: 26px; border: 1px solid var(--line);
  background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--accent-b) 13%, transparent), transparent 60%),
              radial-gradient(90% 80% at 0% 100%, color-mix(in srgb, var(--accent-a) 12%, transparent), transparent 60%), var(--panel); }
.card.w2 { grid-column: span 2; }
.card .v { font-family: var(--display); font-size: 60px; line-height: 0.95; letter-spacing: -0.02em; }
.card .t { margin-top: 8px; font-family: var(--display); font-size: 25px; line-height: 1.15; }
.card .s { margin-top: 6px; font-size: 17px; color: var(--muted); }
.card .viz { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; margin-top: 12px; }
.card.side { flex-direction: row; align-items: stretch; gap: 30px; }
.card.side .ch { flex: 0 0 38%; }
.card.side .viz { margin-top: 0; justify-content: center; }
.card svg { display: block; width: 100%; height: 100%; }
.lab { font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.mrow { display: grid; grid-template-columns: 1fr auto; gap: 3px 10px; align-items: center; margin-top: 6px; }
.mtrack { grid-column: 1 / -1; height: 10px; border-radius: 0 5px 5px 0; background: rgba(255, 255, 255, 0.06); position: relative; }
.mfill { height: 100%; border-radius: 0 5px 5px 0; background: var(--grad); }
.mtick { position: absolute; top: -5px; bottom: -5px; width: 3px; border-radius: 2px; background: var(--text); }
.prog { position: relative; height: 12px; border-radius: 6px; background: var(--grad); margin: 16px 14px 10px; }
.prog::before, .prog::after { content: ''; position: absolute; top: 50%; width: 22px; height: 22px; border-radius: 50%; transform: translate(-50%, -50%); }
.prog::before { left: 0; background: var(--accent-a); } .prog::after { left: 100%; background: var(--accent-b); box-shadow: 0 0 18px var(--accent-b); }
.ends { display: flex; justify-content: space-between; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chips span { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line); font-size: 16px; color: color-mix(in srgb, var(--text) 80%, transparent); }
.wall .go { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 8px 40px 40px; }
.wall .go .mono { font-size: 22px; color: var(--text); letter-spacing: 0.12em; }
.wall .wtitle { font-size: 46px; }
.wall .sign { display: flex; flex-direction: column; gap: 10px; }
.wall .sign .brand { font-size: 28px; }
.wall .sign .brand img { height: 44px; }
.wall .sign .mono { font-size: 17px; color: var(--muted); }
.wall .go .dhbtn { font-size: 21px; padding: 20px 26px; letter-spacing: 0.1em; }
.wall .top { padding: 44px 40px 0; }

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

// Top: spacing only. Bottom: the brand logo left; the slide counter, swipe prompt and
// progress right.
const top = () => `<div class="top"></div>`;
const counter = (i, total) => `<span class="count"><b>${String(i + 1).padStart(2, '0')}</b> / ${String(total).padStart(2, '0')}</span>`;

const foot = (kase, asset, i, total, last = false) => `
  <div class="foot">
    <div class="brand">${brandMark(kase, asset)}</div>
    <div class="nav"><div class="swipe">${counter(i, total)}${last ? '' : '<b>Swipe →</b>'}</div>${last ? '' : `<div class="bar"><i style="width:${((i + 1) / total) * 100}%"></i></div>`}</div>
  </div>`;

const kick = (slide) => `<div class="kick"><span class="badge">${icon(slide.icon)}</span>${esc(slide.kicker)}</div>`;
// A comment/DM keyword when the case has one, otherwise the page's own button label.
const cta = (kase, label = kase.cta.button) =>
  `<div class="dhbtn">${kase.cta.keyword ? `Comment or DM “${esc(kase.cta.keyword)}”` : esc(label)}</div>`;
const media = (slide, img) =>
  `<div class="media">${slide.images.map((id) => `<figure><img src="${img(id)}"></figure>`).join('')}</div>`;

// One stat card. Every chart is drawn from the numbers in the case file.
const VIZ = {
  // a rising line from launch to the end value, like the page's pipeline card
  line: (c) => `<svg viewBox="0 0 600 150" preserveAspectRatio="none"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="var(--accent-a)"/><stop offset="1" stop-color="var(--accent-b)"/></linearGradient>
    <linearGradient id="la" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent-b)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent-b)" stop-opacity="0"/></linearGradient></defs>
    <path d="M10 140 L590 12 L590 150 L10 150Z" fill="url(#la)"/><path d="M10 140 L590 12" stroke="url(#lg)" stroke-width="5" fill="none"/>
    <circle cx="10" cy="140" r="8" fill="var(--accent-a)"/><circle cx="590" cy="12" r="9" fill="var(--accent-b)"/></svg>
    <div class="ends lab"><span>${esc(c.from)}</span><span>${esc(c.to)}</span></div>`,
  // launch -> first lead, like the page's first-lead card
  progress: (c) => `<div class="prog"></div><div class="ends lab"><span>${esc(c.from)}</span><span>${esc(c.to)}</span></div>`,
  // one bar per item, scaled to the largest
  bars: (c) => {
    const most = Math.max(...c.rows.map((r) => r.n));
    return c.rows.map((r) => `<div class="mrow"><span class="lab">${esc(r.label)}</span><span class="lab">${r.n.toLocaleString('en-US')}</span><div class="mtrack"><div class="mfill" style="width:${Math.max((r.n / most) * 100, 2)}%"></div></div></div>`).join('');
  },
  // actual vs the industry minimum (the white tick)
  bench: (c) => {
    const max = Math.max(c.actual, c.standard) * 1.15;
    return `<div class="mrow"><span class="lab">vs standard &gt;${c.standard}%</span><span></span><div class="mtrack"><div class="mfill" style="width:${(c.actual / max) * 100}%"></div><i class="mtick" style="left:${(c.standard / max) * 100}%"></i></div></div>`;
  },
  chips: (c) => `<div class="chips">${c.items.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`,
};
const card = (c) => `<div class="card ${c.wide ? 'w2' : ''} ${c.side ? 'side' : ''}"><div class="ch"><div class="v grad">${esc(c.value)}</div><div class="t">${esc(c.title)}</div>${c.sub ? `<div class="s">${esc(c.sub)}</div>` : ''}</div>${c.viz ? `<div class="viz">${VIZ[c.viz](c)}</div>` : ''}</div>`;

// A filled-out page of the campaign blueprint (Google Slides), redrawn flat: the section tabs
// along the top, then its fields as label / value rows.
const blueprint = (t) => `<div class="bp"><div class="bp-tabs">${t.tabs.map((x, n) => `<span class="${n === t.active ? 'on' : ''}">${esc(x)}</span>`).join('')}</div>
  <div class="bp-rows">${t.fields.map((f) => `<div><b>${esc(f.label)}</b><span>${esc(f.value)}</span></div>`).join('')}</div></div>`;

// The page's tech-stack tree, every tool lit (the page dims the last ones until they scroll in).
const stackList = (items) => `<ul class="tstack">${items.map((t) => `<li><span class="ti">${esc(t.name[0])}</span><div><b>${esc(t.name)}</b><span>${esc(t.role)}</span></div></li>`).join('')}</ul>`;

const SLIDES = {
  hook: (kase, slide, i, total, img, asset) => `
<section class="slide feed hook">
  ${top(kase, i, total, asset)}
  <img class="headline" src="${img(slide.headline)}">
  <div class="pill">${kase.context.map((c) => `<span>${esc(c.label)} <b>${esc(c.value)}</b></span>`).join('')}</div>
  <div class="stats ${slide.oneLiner ? '' : 'no-one'}">${slide.stats.map((id) => `<figure><img src="${img(id)}"></figure>`).join('')}${slide.oneLiner ? `<div class="one"><p>${accent(slide.oneLiner)}</p></div>` : ''}</div>
  <div class="gift">${icon('gift', 52)}<div class="what"><small>Free gift</small>${esc(kase.cta.gift)}</div>${cta(kase)}</div>
  ${foot(kase, asset, i, total)}
</section>`,

  section: (kase, slide, i, total, img, asset) => `
<section class="slide feed">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  ${media(slide, img)}
  ${foot(kase, asset, i, total)}
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
  ${foot(kase, asset, i, total)}
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
  ${foot(kase, asset, i, total)}
</section>`,

  built: (kase, slide, i, total, img, asset) => `
<section class="slide feed">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <div class="steps n${slide.steps.length}">
    ${slide.steps
      .map((s, n) => `<div class="step"><h2><span class="grad">${String(n + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>
        ${s.tile ? blueprint(s.tile) : s.stack ? stackList(s.stack) : `<figure class="${s.cta ? 'even' : ''}"><img src="${img(s.image)}">${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}${s.cta ? cta(kase) : ''}</figure>`}</div>`)
      .join('')}
  </div>
  ${foot(kase, asset, i, total)}
</section>`,

  tease: (kase, slide, i, total, img, asset) => `
<section class="slide feed tease">
  ${top(kase, i, total, asset)}
  ${kick(slide)}
  <h1>${accent(slide.title)}</h1>
  <div class="unlock">${cta(kase)}</div>
  ${media(slide, img)}
  ${foot(kase, asset, i, total)}
</section>`,

  // Title top left, logo bottom left, CTA bottom right.
  wall: (kase, slide, i, total, img, asset) => `
<section class="slide feed wall">
  <div class="top"><h1 class="wtitle">${esc(slide.title)}</h1></div>
  <div class="grid4">${slide.cards.map(card).join('')}</div>
  ${foot(kase, asset, i, total)}
</section>`,

  // Last slide: one question, one button.
  cta: (kase, slide, i, total, img, asset) => `
<section class="slide feed final">
  ${top(kase, i, total)}
  <div class="fbody">
    <h1>${accent(slide.title)}</h1>
    ${slide.sub ? `<p>${esc(slide.sub)}</p>` : ''}
    <div class="fbtn">${cta(kase, kase.cta.finalButton)}</div>
    <div class="mono">${esc(kase.ctaDomain)}</div>
  </div>
  ${foot(kase, asset, i, total, true)}
</section>`,
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
