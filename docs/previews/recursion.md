# Recursion local preview

- Add six poems from `content-source/recursion.txt`, preserving original lines and stanzas. Source contains editorial material and six numbered poem headings; only the poems enter the collection.
- New series `recursion`, ordered Ruang Bising, Sebuah Nama, Hukum Newton, Pi, Rotasi, Normal. Refraction stays at forty poems; archive totals forty-six with new poems appended in order 41–46. Series reading numbers remain 01–06.
- Seven distinct abstract paper/charcoal ImageGen assets: six poems and one cover. Save optimized portrait WebP at 1200×1500 and retain generation prompts.
- Desktop reading image stays fixed at the same viewport coordinates from page open through bottom scroll. Phones keep the normal scrolling image. Remove desktop image entrance movement.
- Keep current Spotify top Play/Pause and permanently visible bottom player. Map songs requested by the user; Stop The Wedding! is confirmed as the Ashe recording. No automatic playback.
- Initially previewed locally. The user subsequently authorized committing and pushing the complete version after a new Halaman Nol illustration and opening-copy update.

## Verification
- Preserve both source manuscripts, all forty existing poem bodies, and six new bodies byte-for-byte after newline normalization.
- Assert exact new series order, separate 40/6 membership, all 46 images, and requested soundtrack metadata.
- Browser: both series, six recursion cards and wrap/navigation, archive count 46; desktop image same x/y before/after all scroll positions; mobile image scrolls naturally.
- Real Spotify Play/Pause on desktop/mobile and all requested track IDs verified from Spotify metadata. No-JavaScript official embeds remain present.

## Completed verification
- Six recursion bodies and all forty refraction bodies match their source manuscripts; 16 Node tests pass.
- Astro check: 0 errors, warnings, hints. Production build: 138 pages.
- Browser suites: archive, refraction, recursion and real Spotify Play/Pause all pass. All 46 archive headings fit the compact viewport sweep.
- Desktop image regression failed on the old sticky layout (y209.5 →137.5 at scroll240), then passed with fixed placement across start, middle, bottom and return-to-top. Mobile remains naturally scrolling.
- Seven generated WebP assets total 1,933,398 bytes, each 1200×1500. Prompt/source/output records: scripts/recursion-art.json.
- Static link audit: 759 internal links across 138 pages, zero broken targets.
- Song metadata checked against Spotify embed data: cardigan, Dan Bandung (feat. Danilla), Before, Stop The Wedding! (Ashe), Take A Chance With Me, About You, La La Lost You (original version).
- Local preview http://localhost:4326/series/recursion/ ; no commit or push performed.

## Visual revision requested by user
- Image top aligns with the initial title box through shared CSS layout values, then remains fixed during scroll. The available image height is capped below that position so it stays inside shorter desktop viewports.
- Replaced all six recursion illustrations and both series covers: angular saturated screenprint (Ruang Bising), pale watercolor (Sebuah Nama), blue cyanotype (Hukum Newton), white embossed paths (Pi), dark light-painting (Rotasi), matte color-field geometry (Normal), refracted glass light (refraction), nested warm paper frames (recursion).
- New prompts, raw sources and final asset paths: scripts/poetry-art-refresh.json. Previous art backed up outside the project at /tmp/scratch-art-before-diversity-XRtwsc.
- No poem text, music choices, or series membership changed; local preview only.

## Approved release
- Regenerated Halaman Nol as a sage-and-limestone abstract map with interrupted rust paths and a folded blank page. Final image: src/assets/puisi/halaman-nol.webp, WebP 1200×1500, 235,772 bytes; prompt added to scripts/poetry-art-refresh.json.
- Opening copy is exactly: a collection of thoughts, regrets, and whatever remains. Verified on desktop, 390px mobile and 320px mobile.
- Fresh release checks: 16/16 Node tests, Astro check 0 diagnostics, 138-page build, archive/series/recursion/Spotify browser suites passing.
- Desktop image aligns with initial title top and remains fixed at different desktop heights; portraits keep natural image scrolling.
- User explicitly approved commit and push of all pending changes to main.
