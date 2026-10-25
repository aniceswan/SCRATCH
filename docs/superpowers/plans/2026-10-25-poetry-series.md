# Poetry Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a treasure-inspired SERIES entry and a minimal series catalog with forty existing poems in one ordered collection.

**Architecture:** Astro series content entries hold a title, cover, order, and ordered references to poems. Static catalog, grid, and contextual reader routes reuse the same poem bodies and reader component. Pure sequence helpers preserve curated order, exclude unpublished members, and wrap reader navigation within that sequence.

**Tech Stack:** Existing Astro, TypeScript, CSS, Node test runner, Sharp, Playwright, built-in ImageGen.

**Spec:** `docs/superpowers/specs/2026-10-25-poetry-series.md`

## Global Constraints
- One series, title Arsip Cahaya yang Salah Arah, all 40 current poems, no second placeholder.
- Index: cover, title, count only; grid: image, number, title, excerpt; 3/2/1 columns desktop/tablet/phone.
- No database, runtime dependencies, duplicate poem text, or changes to existing art.
- Preserve current background, opening, gallery gestures, sounds, and direct poem URLs.

## Review Focus
- Curated order differs from global archive order: previous/next and numbering follow the series.
- A draft member must not appear in counts, cards, or static reader paths.
- First/last and single-member series wrap without leaving their series.
- Deep links and JavaScript-disabled navigation work.
- Phone and landscape headers fit; covers/cards don't overflow or stretch full height.

### Task 1: Series content and reading sequence
**Files:** `src/content.config.ts`, `src/content/series/arsip-cahaya-yang-salah-arah.md`, `src/lib/series.ts`, `src/lib/series-sequence.js`, `tests/series.test.mjs`, `src/assets/series/arsip-cahaya-yang-salah-arah.webp`, `scripts/series-art.json`.
**Interfaces:** `resolveSeriesPoems(references, publishedPoems)` returns available poems in reference order; `readingProps(poems, index, prefix)` returns poem, number, total, previous/next `{title,url}`. `getSeries()` returns published nonempty entries with resolved `poems`.
- [x] Write tests for curated order, omitted unavailable poems, first/last/single navigation and invalid indexes; run and observe RED.
- [x] Implement helpers, reference validation, one explicit forty-member entry and generated WebP cover.
- [x] Run `npm test` and `npm run check`; expect all passing, zero diagnostics.

### Task 2: Treasure entry, catalog, grid, shared reader
**Files:** `src/components/Header.astro`, `src/components/PoemReader.astro`, `src/pages/series/index.astro`, `src/pages/series/[series]/index.astro`, `src/pages/series/[series]/puisi/[id].astro`, `src/pages/puisi/[id].astro`, `src/styles/global.css`, `src/styles/series.css`, `src/scripts/poem-links.ts`, `scripts/check-series-browser.mjs`, `README.md`.
**Interfaces:** consumes `getSeries()` and `readingProps`; contextual URLs `/series/<series>/puisi/<poem>/`, return link `/series/<series>/`; archive URLs remain `/puisi/<poem>/`.
- [x] Write browser flow for archive SERIES entry, minimal one-card catalog, forty grid cards with correct excerpts, 3/2/1 layout, contextual first/last navigation, direct URL and no-JS access. Run before UI and observe RED.
- [ ] Implement header chest, pages, reusable reader, and existing opening sound for grid links.
- [ ] Run `npm test`, `npm run check`, `npm run build`, existing browser suite and series browser suite. Inspect desktop/mobile screenshots and new cover.
- [ ] Fresh independent review; fix significant findings with regression coverage. Commit and integrate by fast-forward, push as previously authorized; confirm clean/synced status.

## Progress
- Baseline: branch `feat/poetry-series` at `1673030`, clean checkout, 11 tests passing.
- Execution: native implementation in the current checkout, following the user's instruction to proceed; no worktree was created.

- Task 1 complete: helper RED (module absent) → GREEN, 15/15 Node tests, Astro check 0 diagnostics, build 42 pages.
- Task 2 RED: browser asserts missing archive SERIES link (0 != 1), as expected.
