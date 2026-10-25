# Poetry series

Approved direction: a new SERIES entry beside BACK in the archive, as a simple text link matching BACK. The index shows only each series cover, title, and poem count. A series opens a regular vertical grid, three columns on desktop, two on tablet, one on phones; each poem shows its number, image, title, and existing short excerpt. Current forty poems belong to one series, **refraction** (name explicitly supplied by the user). No second-series placeholder or description.

Use a new ImageGen abstract cover matching the paper, graphite, and charcoal artwork already present. Keep fonts, gradient, current mobile background fix, opening layout, sounds, and archive gestures.

## Approach

Chosen: an explicit Astro content collection for series, with ordered references to existing poems and static pages. Share a reader component between normal poem URLs and contextual series poem URLs so previous/next stay inside a series and work without JavaScript. Adding the second series later requires one content file and a cover. Alternative: query-string context handled in the browser; discarded because static contextual links also work without JavaScript and don't flash the archive sequence.

No database, new runtime dependencies, duplicate poem bodies, or changes to the existing poem artwork/content.

Follow-up preferences: tab titles use `Page | SCRATCH`; the series URL is `/series/refraction/`. Original series URLs redirect to the renamed series, including contextual reader links, without JavaScript. The cover artwork stays the same.
