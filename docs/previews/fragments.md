# Fragments

Developed and reviewed locally on `preview/fragments`, then approved for publication on `main`.

- Main navigation: **POEMS** replaces the visible **SERIES** label. Existing `/series/` URLs remain valid.
- **FRAGMENTS** opens `/fragments/` directly, without collection subdivisions.
- The fragment grid always has two columns, including mobile, with landscape 4:3 artwork. One supplied fragment creates one card; no placeholder entries are added.
- The reader uses the same illustration as a fixed background at 11% opacity, or 10% on mobile. Prose stays in the normal document flow over the paper canvas.
- Main and v3 backgrounds have a visible pale-blue gradient, shared by the opening, archive, collections, and fragment reader. Poems and Fragments share the gold navigation button style.
- The first fragment uses “Coming Up Roses - Instrumental” by Piano Dreamers ([Spotify source](https://open.spotify.com/track/0KRBnZ1LIgkQNj80pECMRY)). It shares the poem reader's top Play control and bottom official player, without autoplay. Other fragments can add optional `spotify` metadata with trackId, title, and artist.
- The first fragment preserves the complete title and all five supplied paragraphs. The manuscript is archived in `content-source/fragments/rembulan.txt`.
- Existing poems, soundtracks, and the preserved classic/editorial layouts remain separate. The v3 copy shares the new navigation and fragment routes.

## Preview

Open `http://localhost:4326/fragments/` after a build served by the existing preview server. The first reader is `/fragments/jikalau-aku-adalah-rembulan-akankah-kau-menemaniku-sampai-akhir/`.

To add another fragment, create a Markdown file under `src/content/fragments/`, with title, order, landscape image, imageAlt, excerpt, lang, and draft fields. It appears directly in the grid, ordered by its order field. No series assignment is needed.

## Illustration

Generated with the built-in `image_gen` tool. The final project asset is `src/assets/fragments/rembulan.webp`, 1440×1080 WebP. The complete generation prompt, source filename, and encoding settings are recorded in `scripts/fragments-art.json`.

## Validation

`npm test`, `npm run check`, and `npm run build` validate content, image geometry, and generated routes. Run `scripts/check-fragments-browser.mjs` with the existing Playwright/Chrome environment to check seven viewport sizes, two-column cards, exact prose, background opacity and scroll behavior, sibling navigation, v3 paths, classic isolation, and no-JavaScript reading. Screenshots are saved under `/tmp/scratch-fragments-*`.
