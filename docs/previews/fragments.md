# Fragments

Developed and reviewed locally on `preview/fragments`, then approved for publication on `main`.

- Main navigation: **POEMS** replaces the visible **SERIES** label. Existing `/series/` URLs remain valid.
- **FRAGMENTS** opens `/fragments/` directly, without collection subdivisions.
- The fragment grid always has two columns, including mobile, with landscape 4:3 artwork. One supplied fragment creates one card; no placeholder entries are added.
- The reader uses the same illustration as a fixed background at 17% opacity, or 16% on mobile. Prose stays in the normal document flow over the paper canvas, with the same body text size and line height as poem readers.
- Main and v3 backgrounds have a blue accent fading from the upper right into the paper color, shared by the opening, archive, collections, and fragment reader. Poems and Fragments share the gold navigation button style.
- The first fragment uses “Untuk Perempuan Yang Sedang Di Pelukan” by Payung Teduh via YouTube. All fragments use optional `youtube` metadata with videoId, title, artist, and startSeconds; there is no Spotify runtime or automatic fallback.
- Current playback: all poem and fragment readers use the shared YouTube player, play once from the beginning, and stop at completion. The saved Spotify selection described below is historical; Spotify is no longer mounted anywhere.
- YouTube fragment player: the first fragment prefers `youtube` metadata over `spotify`. It uses [Hestek Studio's upload](https://www.youtube.com/watch?v=3H2SpXpIwhY), an alternative upload selected with the user's approval, with a visible player below the prose and the same top Play/Pause control. The current selection starts at 00:00 and plays the complete approximately 5:38 video, then stops naturally. The Play control returns to its initial state at completion, and another click plays from the beginning. No repeat, `end` parameter, or 30-second cutoff is applied. Despite the video's title, the uploader is not being represented as the band's official channel. Official and several lyric uploads returned error 150 in the test browser; this upload successfully played in the preliminary and integrated fragment tests. The saved Spotify selection is not mounted or started as an automatic fallback. A refused embed displays a readable message and a direct YouTube link. The video pauses when the page is hidden. No audio/video file is copied into the repository. Without JavaScript, the iframe and direct link are rendered; the top custom Play/Pause control requires JavaScript.
- The first fragment preserves the complete title and all five supplied paragraphs. The manuscript is archived in `content-source/fragments/rembulan.txt`.
- Existing poems, soundtracks, and the preserved classic/editorial layouts remain separate. The v3 copy shares the new navigation and fragment routes.

## Preview

Open `http://localhost:4326/fragments/` after a build served by the existing preview server. The first reader is `/fragments/jikalau-aku-adalah-rembulan-akankah-kau-menemaniku-sampai-akhir/`.

To add another fragment, create a Markdown file under `src/content/fragments/`, with title, order, landscape image, imageAlt, excerpt, lang, and draft fields. It appears directly in the grid, ordered by its order field. No series assignment is needed.

## Illustration

Generated with the built-in `image_gen` tool. The final project asset is `src/assets/fragments/rembulan.webp`, 1440×1080 WebP. The complete generation prompt, source filename, and encoding settings are recorded in `scripts/fragments-art.json`.

## Validation

`npm test`, `npm run check`, and `npm run build` validate content, image geometry, and generated routes. Run `scripts/check-fragments-browser.mjs` with the existing Playwright/Chrome environment to check seven viewport sizes, two-column cards, exact prose, background opacity and scroll behavior, sibling navigation, v3 paths, classic isolation, and no-JavaScript reading. Screenshots are saved under `/tmp/scratch-fragments-*`.

For the YouTube player, run `scripts/check-youtube-browser.mjs` with the same browser environment. The controlled SDK checks cover complete-song playback, natural stop, replay from the beginning, Pause, native controls, failure messages, mobile player dimensions, and absence of automatic Spotify playback.
