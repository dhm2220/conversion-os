# Content Engine: Decisions

Source: PR #1 (`claude/dh-content-case-study-9us8l7`, merged 2026-10-20 as `f59d696`): its description, 30 commits, and the code in `content-engine/`. Nothing here is new; each line points back to one of those sources.

## What it is

`content-engine/` turns one case study page into the content that promotes it. The page comes in as a phone scroll recording, page crops, or a URL. Every asset is built from real screens of the page, in scroll order.

## Slide structure

### Growth cases (from a live case study page): 8 slides, 4:5 (1080×1350)

1. Hook: the page's 3 hero stat cards plus a fourth box with the case one-liner (2×2). With 12+ unique tiles, the cover uses the site's 3D marquee of the work instead.
2. Transformation: Before / After.
3. Business / Problem / Solution: typeset from the page copy, with persona / warning / idea icons.
4. Social proof: testimonials in the boxed card anatomy (`testimonials-marquee-grid-boxed`).
5. What we built: one merged slide, 4 steps, each step with its page visual. The tech stack is typeset with every tool highlighted. The deliverables step (the content upgrade) carries the CTA.
6. Content-upgrade tease: title as a question, with the CTA left-aligned under the title at about 75% of the text width.
7. Campaign Results stats wall: a full-bleed bento of the case's best numbers in the page's own card style. Title top left, logo and URL bottom left. Charts are drawn from the case file numbers.
8. Final CTA.

Story maps: 9:16 (1080×1920) and 4:5 (1080×1350), with the whole case study on one image.

### Engineering cases (from a draft + playbook): `src/from-draft.mjs`

Hook · before/after · business/problem/solution · what we built · the work · proof · CTA, plus an engineering data slide (stat cards + milestone timeline). Each "what we built" step shows its deliverable (persona brief, UX page, site, dev pages, brand guide, wireframes, funnel). Deliverable slides use eyebrow · headline · one line · visual. Lateral is built from the client project deck: a process overview plus one slide per deliverable (19 slides).

### MCM Private Care family stories (7 carousels)

MCM's locked look: Inter only, navy + gold. Copy comes from mcm-live's locked case data, word for word. Only MCM's approved photos are used. Beats without a fitting photo use MCM's locked text-only card.

### Chrome on every slide

- Footer: logo bottom left; "Swipe →" and the slide counter bottom right.
- Production fonts: Blanc 700 display and Blanc 200 pill/quotes (the files 0hr.app serves), Inter body, system mono labels.
- Mono palette (black/white) when a case has 3+ real deliverables, so the work carries the color.
- Brand defaults come from the DH site tokens (#4169E1 → #FF1493, Blanc, logo). Our own pages keep the DH brand and link to differenthunger.com.

### Channel packs: `npm run studio`

Every QA-passing case is exported as IG/FB 4:5, a LinkedIn PDF, 9:16 Stories/Reels/TikTok, X (4), and a Pinterest pin. Captions are built only from the case's own fields.

## Copy rules (QA gate: `src/qa.mjs`)

A carousel passes only when nothing on it was made up.

- FAIL: a slide line that is not word for word in the case's sources (growth = the live page's text; engineering = the draft + spec; MCM = MCM's locked case data).
- FAIL: an image that is missing, blank, or a near-solid fill.
- FAIL: more than 6 objects on one slide.
- FAIL: the same image used on two slides.
- WARN: a published claim our own source check contested. It stays on the slide and is never hidden. Listed: `$11.9M`, `$100K+/mo`, `$100,000/month`, `16 new inbound leads`, `Entire in-house team replaced`.
- A slide whose source isn't on the page is left out.
- Template chrome (section names, button labels) is the only text the templates own (the `CHROME` list in `qa.mjs`).

## CTA keyword

- When a case sets `cta.keyword`, the button reads `Comment or DM "<KEYWORD>"` (`src/templates/stack.mjs`).
- With no keyword, buttons use the page's own labels (`GET INSTANT ACCESS`, `START NOW`, `Call MCM at 240-789-4890`).
- The only keyword set today is `SEQUENCE`, in `cases/preview-steelcon-wall6.json` (gift: "The exact outreach sequence behind this $10M+ pipeline"). `cases/steelcon.json` and every other production case have no keyword, so they show the page labels.
- CTA domain: differenthunger.com.

## Open items

- [ ] CTA keyword: `SEQUENCE` exists only on the SteelCon preview case. Decide whether production cases get a keyword or keep the page labels.
- [ ] Sped-up preview reel 9:16 (URL → MP4) is marked "next" in the README; not built.
- [ ] `cases/mcm.json` is ready for URL capture "once the domain is reachable"; the 7 MCM carousels are built from locked case data instead.
- [ ] `source/` (recordings, crops, brand assets) and `output/` are not committed: the repo is public and the Blanc font may be licensed. A fresh clone can't render until the source assets are supplied.
- [ ] Contested claims (list above) still publish with a WARN. Each needs a keep/remove call.
