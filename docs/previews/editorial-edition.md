# SCRATCH / editorial edition

Alternative editorial design, retained at `/v2/`. The approved paper design is the main website; the original visual edition is preserved at `/classic/` through shared components and content.

- Single-screen opening: `/v2/`
- Archive with title search, series filters, shareable filter URLs, and a random poem: `/v2/archive/`
- Series covers: `/v2/series/`
- Collections: `/v2/series/refraction/` and `/v2/series/recursion/`
- Readers: `/v2/puisi/<id>/` and `/v2/series/<series>/puisi/<id>/`
- Original edition: `/classic/`, also linked in the editorial footer.

## Direction

An art journal on lightly textured paper, with Newsreader display typography, ink green text, and ultramarine accents. The opening is deliberately minimal: ink mark, wordmark, the original collection tagline, and a single arrow into the archive. It fits the viewport without scrolling, including short landscape screens. Copyright and the original-edition link sit quietly at the bottom. Artwork and collections are explored in the archive and series pages. The design uses the existing illustrations, 46 unmodified Markdown poems, two series, and soundtrack metadata.

The desktop reader fixes its illustration at the initial title height. Mobile readers use the normal document flow. The shared Spotify player keeps its top Play button, visible bottom embed, and completion reset. Navigation stays within the new edition, including contextual previous/next links. All content and normal navigation remain available without JavaScript; archive search and filters enhance that content when JavaScript is available. Motion respects the reduced-motion preference. These preview pages carry `noindex` metadata.

## Local preview and validation

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4326
```

Open `http://localhost:4326/v2/`. This edition contains 97 static pages.

```sh
npm test
npm run check
BASE_URL=http://127.0.0.1:4326 CHROME_PATH=/usr/bin/google-chrome PLAYWRIGHT_MODULE=/tmp/farmhub-browser-qa/node_modules/playwright/index.mjs node scripts/check-edition-browser.mjs
```

The browser check covers 1440×1000, 1440×600, 768×1024, 390×844, and 320×568; archive search and filters; covers and contextual series links; original poem text; image alignment and scrolling; real Spotify Play/Pause; overflow; reduced motion; and no-JavaScript access. Opening-only checks also cover 2560×1440, 1280×720, 320×480, 320×360, 844×390, and 568×320. They check that every element fits naturally, wheel/keyboard scrolling cannot move the page, and the first keyboard action enters the archive. Screenshots are written under `/tmp/scratch-edition-*`.

The user approved pushing the completed work while retaining this alternative design alongside the main website.
