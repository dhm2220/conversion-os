# DH Content Engine

One source of truth, the case study page, becomes the content that promotes it. Every asset
is made from **real screens of the page, in scroll order**, so the viewer gets a first-person
look at what comes next on the next click.

```
case study page (source of truth)
        │  scroll recording / headless capture
        ▼
  shots/*.png ──► stacked carousel (4:5)    ← built
        │     ──► story map 9:16 + 4:5       ← built
        │     ──► sped-up preview reel 9:16  ← next: URL → MP4
        │     ──► stories, YouTube Shorts, blog/email embeds
        ▼
  Content Planner (Micro rows linked to the Core row)
```

## Formats

| Output | Size | What it is |
|---|---|---|
| `carousel-01-cover` | 1080×1350 | Headline, the 3 key results, 3 hero screens fanned out |
| `carousel-02…05-chapter` | 1080×1350 | One chapter of the story per slide, **3 consecutive screens stacked** with step labels |
| `carousel-06-cta` | 1080×1350 | Bonus/lead magnet screens + "Read the full story" |
| `map-story-9x16` | 1080×1920 | The whole case study on one image, 12 numbered screens (Stories, Pinterest, LinkedIn) |
| `map-feed-4x5` | 1080×1350 | The whole case study on one feed image, 10 screens + key results |

Stacking 3 screens on each slide puts three times the proof on a slide compared with one
idea per slide, and the step-down layout reads like scrolling.

## Run it

```bash
cd content-engine
npm install                         # playwright + ffmpeg-static
npm run build -- cases/steelcon.json
# -> output/steelcon/*.png (+ the .html each was rendered from)
```

`source/` (recordings) and `output/` are gitignored.

## Add a case study

**From a URL** (no recording needed): set `"url"` in the case file and run
`npm run build -- cases/<id>.json`. It captures the page as phone screens, reads the site's own
colors into `brand.json` (so the slides come out in that brand), writes a contact sheet, and
stops until you pick shots. Shots then pick screens by number: `{ "id": "hero", "screen": 1 }`.
`cases/mcm.json` is set up this way.

**From a phone recording:**

1. Record the page on a phone (scroll top to bottom, ~12s) and drop it in `source/<id>-scroll.mov`.
2. Copy `cases/steelcon.json` to `cases/<id>.json` and fill in the copy fields from the
   **Case Studies** tab of the Content Management OS (headline, industry, KR1–3, Live URL).
3. Run `npm run frames -- source/<id>-scroll.mov cases/<id>.json output/<id>/shots --sheet`
   and open `output/<id>/shots/contact.jpg`. Tile *n* (left to right, top to bottom, from 0)
   is at **t = n × 0.25s**. Set each shot's `t` in `shots`.
4. Set `carousel` (which shots go on which slide, with labels) and `storyMap` (12 shot ids).
5. `npm run build -- cases/<id>.json`.

Pick frames where counters and charts have finished animating, and never a frame showing the
keyboard or a typed email.

## Files

- `src/capture-url.mjs`: loads a URL at phone size, screenshots it screen by screen, and
  reads its colors into `brand.json`
- `src/frames-from-video.mjs`: samples the recording onto a fixed 8fps timeline, crops the
  phone status bar and browser bar, and writes `<shot id>.png`
- `src/templates/stack.mjs`: the slide templates. Brand defaults are Different Hunger's; a
  case file's `brand` or the captured `brand.json` overrides them
- `src/render-carousel.mjs`: renders each template to PNG with headless Chromium
- `src/build.mjs`: runs both for one case file
- `fonts/`: Plus Jakarta Sans + JetBrains Mono (OFL), vendored so renders work offline
