# Centered Carousel Preview Implementation Plan

> **For agentic workers:** Use native execution to implement this local preview.

**Goal:** Replace hanging prints with a symmetric centered carousel and stronger gradient, for local review only.
**Architecture:** Keep the existing bounded catalog pool and damped position follower. Replace rope/spring geometry with symmetric 2D slide transforms; simplify the DOM and center the home layout. Use existing Astro/CSS/TypeScript and tests.
**Spec:** `docs/superpowers/specs/2026-10-25-centered-carousel-preview.md`

## Global Constraints
- Local preview only; no push and no changes to poems or series contents.
- Center active card, smaller left/right neighbors, horizontal sliding and click-to-select sides.
- Preserve mobile background undercoat, intro, audio, SERIES/BACK and reduced motion.

## Review Focus
- Both sides remain visible across forward/backward wrap; slot reuse does not jump visible cards.
- Clicking a side selects it; clicking the active card reads it; dragging does not navigate.
- Portrait/landscape/320px viewports fit without scroll overflow or title/control overlap.
- RAF stops when settled; reduced motion skips interpolation; no-JS still exposes all poem links.
- Background remains opaque on fast mobile reading scroll.

## Tasks
- [x] Write failing geometry and symmetric pool tests, then implement centered transforms.
- [x] Replace clothesline markup/controller and styles; add accessible arrow controls and side selection.
- [x] Update archive browser tests, run Node/Astro/build/browser verification and inspect desktop/mobile screenshots.
- [x] Independent review, address significant findings, keep a local preview running and report its URL. Do not push.

## Progress
- Starting point: `9b37fe3`, clean checkout; dedicated local branch `preview/centered-carousel`.

- Geometry regression: 3 failures before the implementation, then all 7 gallery tests passing. Full Node suite: 14/14.
- Final Astro check: 0 errors, warnings, or hints. Production build: 125 pages.
- Archive and series browser suites pass, including side-card selection, controls, pointer drag, wheel, touch, sound, reduced motion, no-JavaScript links, legacy series redirects and mobile fast-scroll background.
- Independent review found heading clipping at 320×568/1440×600 and a landscape query incorrectly applied to 320×480 portrait. Reproduced the long-title failure, changed the heading row to honor min-content height, compacted typography on short screens, and constrained landscape layout by orientation. Browser regression now checks all 40 headings at 320×568, 1440×600, and 320×480; all pass.
- A transient browser view-transition abort was traced to rapid consecutive automated navigation; the series browser test now settles active animations before the next navigation. Production transition behavior is unchanged; final suites pass sequentially.
- Final preview: http://localhost:4326/#arsip . Work stays uncommitted on preview/centered-carousel; no push performed.

- User correction applied: preserve original left heading/right archive layout, left-aligned mobile heading, and reduce card spacing from .86 to .48 card widths for a close overlapping stack. Side-card click tests now target the exposed outer edges rather than the overlapped centers. Still no commit or push.

- Further user correction: card spacing is now .20 card widths, with visible side edges only; responsive card width reserves space for the entire stack. Removed track clipping; visible-card bounds are checked to remain inside the carousel with safe padding. Preview stays local and uncommitted.

- SERIES styling revised to a simple gold gradient button, text and arrow only, no treasure icon. Production build and focused desktop/390px/320px browser checks pass. Spotify integration discussed only, not implemented. No commit or push.

- User approved publishing the current version: "oke yang sekarang bisa push dulu". Fresh verification before integration: 14/14 Node tests, Astro check 0 diagnostics, production build complete. Spotify remains unimplemented.
