# SCRATCH / paper edition

The existing composition with the editorial edition's ivory paper (`#f4f3ec`), ink tones, blue accent, and Newsreader display font. The opening, compact overlapping carousel, title at the left on desktop, series grid, reading layout, and music player use the existing components. The gold series button remains part of the original composition.

The paper opening omits the ink logo beneath the wordmark. In the archive, the ink logo is paired with the name “scratch”. Carousel pictures reach the card edges without the original padded paper frame.

The opening tagline is centered beneath the wordmark, with the entry arrow at its side. Four existing poem illustrations decorate the corners without adding scrolling; publication labels and collection counts are omitted. The opening has no asterisk. In the series index, “series” sits beside the ink logo as the page heading; the large standalone heading and its asterisk are omitted. Series collection pages also carry the small “series” brand label.

Approved for the main website. Edition URLs:

- Main website: `/?intro=1`
- Preserved original: `/classic/?intro=1`
- Editorial: `/v2/`
- Copy of the approved design: `/v3/?intro=1`

All 46 poems and both series are available in the main website, `/classic/`, and `/v3/`, including contextual series readers. Internal navigation keeps the selected edition. The original and paper editions have separate opening-session keys. The palette is scoped to `html.classic-paper`, applied to the main website and `/v3/`; `/classic/` retains the original warm palette and Fredoka headings. The reader and archive reuse the original content rather than maintaining another copy. Alternate editions have `noindex` metadata; the main website remains indexable.

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4326
BASE_URL=http://127.0.0.1:4326 CHROME_PATH=/usr/bin/google-chrome PLAYWRIGHT_MODULE=/tmp/farmhub-browser-qa/node_modules/playwright/index.mjs node scripts/check-classic-paper-browser.mjs
```

The browser check covers five viewport sizes, palette/font application, the original opening and carousel, edition-specific links, series navigation, fixed desktop imagery, mobile flow, all 46 headings on three compact viewports, separate opening sessions, and no-JavaScript access. Screenshots are written to `/tmp/scratch-paper-*`.

The user approved committing and pushing this design as the primary website, with the original edition preserved separately.
