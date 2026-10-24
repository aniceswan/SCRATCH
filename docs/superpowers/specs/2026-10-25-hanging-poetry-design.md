# Arsip Cahaya yang Salah Arah

Replace the previous 48 poems and images with the 24 poems supplied in the user's manuscript. Preserve titles, lines, stanza breaks and manuscript order. Editorial notes and section headings are not poems. Generate one original cinematic still-life photograph per poem, using its actual imagery, and save optimized portrait WebP assets in the repository.

Keep SCRATCH's existing typography, intro and one-screen responsive archive. Connect cards to a common clothesline with fine cords and wooden clips. Use a damped spring for visible swing after scroll, drag or keyboard input; stop animation when settled and honor reduced motion. Render at most nine reusable cards, updating only nearby image sources. Keep all poem links available without JavaScript.

Play a soft, synthesized paper sound on an actual change of the active poem, after user activation. Provide a persistent accessible mute button. Audio failures must not stop navigation, and no sound should play on initial render or resize.

The user authorized implementation, replacement of the old collection, generated artwork, commit and push to main. Work directly in this checkout, preserving the current SCRATCH | Poetry title. No new runtime framework or database.

Approach: a bounded reusable card pool preserves the existing continuous carousel; adding every card forever would retain its scaling problem, while pagination would change the interaction. Web Audio avoids additional sound downloads. Built-in ImageGen supplies distinct real images rather than procedural placeholders.

## User refinements after the first release

The user replaced the original paper-brush sound and mute preference with an always-enabled dry wooden ctak-ctak. Ignore the previous stored mute value and expose no sound control. Browser audio still starts after a click, touch or key; unsupported audio must not block navigation.

Run two parallel cords along the archive depth, from left foreground to right background, projecting the cords and moving clothespins through the same camera as the cards. Shorten the ink logo while retaining a usable touch target. Increase normalized wheel travel by 2.25× and use critically damped position following for continuous acceleration/deceleration; increase drag travel while preserving one-card arrow navigation.

Verification for these refinements: 11 Node tests, Astro diagnostics and production build, plus real Chrome checks of sound with a stale stored mute value, diagonal projected cord direction, increased wheel travel, drag, wrapping, bounded slots, stopped animation, touch/replay, reduced motion and no-JS poem links. Desktop, mobile and landscape screenshots visually inspected.

## Unified background, foreground cords and recorded audio

The next user revision asks for a stronger continuous gradient, removal of visible panel seams, complete opaque cords above the prints, copyright text without a Footer component, BACK instead of INTRO, and a more finished opening button.

The archive's clipped local light layers are removed. One page-wide warm gradient now provides the background, with no separate footer surface. All pages include the copyright paragraph directly. Opaque SVG cords render above the card plane, extend beyond both viewport sides, and curve above the title area. Visible rear prints retain full opacity. The opening control has a shaded terracotta disc, SVG arrow, solid outer ring, label and keyboard focus state.

The synthesized clicks are replaced by two short excerpts from dynamique's CC0 recording of moving clothes hangers. Source and transformations are recorded in src/assets/audio/SOURCES.md. Combined audio download is roughly 10 KB and loads once after interaction; no audio control is exposed.

Verification: 10 Node tests, zero Astro errors/warnings/hints, 26 generated pages, and real desktop/mobile browser checks. The browser suite verifies recorded sample duration, foreground cord ordering, continuation beyond the viewport, title clearance, BACK text and direct copyright markup, as well as existing gallery behavior. Opening and gallery screenshots inspected on desktop, mobile and short landscape layouts.

## Direct clothespins and reading flow

A subsequent screenshot reproduced the poem page's sticky colored/blurred header strip. Both desktop and mobile sticky header backgrounds are removed; the header scrolls naturally with the poem and the picture retains its own sticky position. The two-rail and dangling-string construction is replaced with one taut diagonal clothesline, a visible mounting eyelet, and a single central clothespin per print. Card swing pivots directly at the clip on the rope. This removes the artificial foreground bend and the long separate tethers.

The user also requested a sound when opening a poem, previous/next poem links with titles, ARCHIVE instead of ARSIP, and numbering for every poem. Archive and reading pages show 01 / 24 through 24 / 24. Reading links follow manuscript order and wrap at either end. Opening a poem plays a short clip-release variation from the shared recorded sound, before navigation, while modified clicks keep normal browser behavior. Navigation remains available without audio or JavaScript.

Verification: the sticky header and missing opening sound were reproduced by failing browser regressions before fixes. Ten Node tests pass, Astro check has zero diagnostics and the build produces all 26 pages. Real Chrome tests verify the new line/eyelet, opening audio, numbered archive/detail views, titled reading links, first/last wrapping, ARCHIVE text, desktop/mobile scroll behavior, reduced motion, no-JS links, and prior gallery interactions. Desktop and mobile screenshots inspected after entry animations finish.

The user replaced the small foreground eyelet with a wooden support post. The post has a shaded front and side, wood grain, a ground shadow and a short rope binding at the existing mount point. Its height follows the available archive space on desktop and mobile; card and rope geometry remain unchanged. The browser suite checks that the rope is attached to the post and that the support reaches toward the ground.
