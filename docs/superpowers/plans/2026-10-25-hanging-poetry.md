# Hanging Poetry Implementation Plan

> **For agentic workers:** Execute inline using superpowers:executing-plans. Track progress here; user already requested implementation, commit and push.

**Goal:** Replace the collection with 24 illustrated manuscript poems and a lightweight hanging-card archive with sound.

**Architecture:** Static Astro pages and a bounded nine-card browser pool. A pure gallery helper controls wrapping and damped springs, while a focused audio module creates a quiet paper effect. Source parsing is separate from browser behavior.

**Tech Stack:** Existing Astro, TypeScript, CSS, Node test runner, Sharp and built-in ImageGen.

**Spec:** docs/superpowers/specs/2026-10-25-hanging-poetry-design.md

## Global Constraints
- Preserve the exact manuscript body, line breaks and source ordering.
- Retain SCRATCH | Poetry and current responsive styling.
- No database or new runtime framework; at most nine card nodes.
- Mute persists; audio only on navigation after activation; reduced motion disables swing.
- User explicitly authorized replacing old poems and committing/pushing to main.

## Review Focus
- Backward wrap and fast scroll must select the right title, image and link.
- Empty/small collections must not duplicate slots or divide by zero.
- Dragging must not trigger a poem click; keyboard navigation remains usable.
- Reduced motion and unavailable audio must leave navigation working.
- Import must exclude editorial/section prose and preserve all poem lines exactly.

### Task 1: Content and gallery contracts
- [x] Add behavioral Node tests for manuscript parsing, invalid numbering, wrapping, bounded slots and spring settling; observe failures.
- [x] Implement scripts/import-poems.mjs and src/lib/gallery.js, then rerun tests.
- [x] Generate 24 distinct images; preserve prompts in scripts/poetry-art.json. Back up old assets, replace content and add optional order/lang metadata.

### Task 2: Hanging carousel and paper sound
- [x] Update Archive.astro to render a bounded pool and safe compact metadata, including responsive image sources.
- [x] Move existing page interactions into src/scripts/gallery.ts, keeping intro behavior and integrating slot reuse, spring swing and SVG cords.
- [x] Add a lazy Web Audio paper sound module and accessible persistent header control.
- [x] Style common clothesline, threads and clips; retain responsive sizing and reduced motion.

### Task 3: Verify and deliver
- [x] Run Node tests, Astro checks and production build; verify 24 source-exact poem pages and corresponding assets.
- [x] Exercise desktop/mobile scroll, drag, keyboard, repeated wrapping, audio/mute, reduced motion and no-JS links in a real browser.
- [x] Visually inspect generated artwork and desktop/mobile screenshots, review final diff, fix material issues.
- [x] Update README and prepare the authorized commit/push. Git commit, push output, and final status are the delivery record.

## Progress
- Manuscript inspected: 24 poems, five sections, five English poems.
- ImageGen jobs started, one distinct image per poem; no placeholder substitutions.
- Ruling: execute in the current checkout because the user explicitly continued the existing main-branch workflow and requested commit and push.

- Verification: seven Node tests pass, Astro check has zero errors and zero warnings, production build creates 26 pages (24 poems plus home and 404).
- Real Chrome QA passes on desktop, 390×844 touch mobile, and 844×390 reduced-motion layout. Confirmed persistent mute, actual audio sources after gestures, nine-card bound, wrapping and image/link consistency, no-JS links, spring animation shutdown, and intro replay.
- Read-only independent review reported no important or critical findings.
- A real-touch regression run exposed the inherited intro replay listener omission on direct archive entry; the test failed before moving the entry listener outside the skip condition, then passed in the saved browser suite.
- Artwork: all 24 distinct built-in ImageGen outputs were visually inspected as a contact sheet and encoded as 1200×1500 WebP. Prompt set is scripts/poetry-art.json.
