# Poetry soundtracks

All 46 published poems have Spotify soundtracks, shared by the main, classic, editorial, and v3 editions. The existing top Play button and visible player below the poem use the same track metadata.

The curation in `content-source/playlist-puisi.txt` fills 38 previously empty selections. The original eight selections remain unchanged: Halaman Nol, Kontur, Ambang, The Weather I Withheld, The Longest Time, Katalog Benda yang Tak Jadi, Sebuah Nama, and Pi.

`scripts/poem-soundtracks.json` records all 43 unique tracks, their Spotify URLs, and their poem assignments. Titles, artist identities, playability, and preview availability were checked against public Spotify embed metadata when applying the curation.

The source spelling “Palimpsest” refers to the existing poem “Palimsest”. “Pintu yang Terkunci” is listed in the curation but has no published manuscript, so no poem or assignment was created for it. The existing series names and memberships remain unchanged.

Tests verify every assignment against the curation and manifest, preserve the eight original choices, and retain all original poem lines and stanza breaks. The Spotify browser check covers real playback of a preserved track and the newly assigned Every Summertime, along with pause, natural completion, replay, keyboard controls, and no-JavaScript access.
