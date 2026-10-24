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
