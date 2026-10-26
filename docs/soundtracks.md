# Poetry soundtracks

All 46 published poems and the first fragment use the shared YouTube iframe player. The main, classic, editorial, v3, and series readers use the same curated songs. The top Play/Pause button controls the visible player below the complete poem or prose.

Playback starts at the beginning after an explicit Play action, runs until the end, and stops. Completion restores Play; another click restarts from zero. There is no automatic loop, preview cutoff, or autoplay. The player pauses when the page is hidden. It is mounted immediately on reading pages so it can become ready before Play, matching the user's loading preference. Archive and catalog pages do not mount music players.

The curation in `content-source/playlist-puisi.txt` supplied 38 selections. The original eight choices remain unchanged: Halaman Nol, Kontur, Ambang, The Weather I Withheld, The Longest Time, Katalog Benda yang Tak Jadi, Sebuah Nama, and Pi. The fragment retains Payung Teduh's “Untuk Perempuan Yang Sedang Di Pelukan”.

`scripts/poem-soundtracks.json` records all 43 unique poem tracks and their assignments. The original Spotify IDs/URLs remain as curation references only. Each record also includes the chosen YouTube video, uploader, source URL, and embed-check result. Reading pages no longer mount Spotify or download its SDK. Prefer the original recording and reject covers, live performances, altered-speed versions, commentary, and unrelated videos. YouTube availability and embed permission can change independently of the website.

The video and SDK load directly from YouTube in the visitor's browser. No music/video files, streaming proxy, Vercel Functions, or new backend are added. A refused embed shows a readable status and a direct “Buka di YouTube” link. The iframe and external link also work without JavaScript; the top custom control requires JavaScript.

“Palimpsest” in the source list refers to the existing poem “Palimsest”. “Pintu yang Terkunci” has no published manuscript, so no poem or assignment was created for it. Series names and membership remain unchanged.

Validation: `npm test` preserves every poem line and stanza and checks all 46 assignments against the manifest and original curation. `scripts/check-youtube-browser.mjs` checks top/bottom placement, Play/Pause synchronization, unrestricted duration/seeking, natural stop, replay, blocked playback, mobile minimum player size, all editions, and no-JavaScript access using a controlled SDK. Source selection separately uses the real YouTube player rather than treating an available URL or thumbnail as proof of playback.

The 43 unique poem sources were verified through actual playback on the HTTPS SCRATCH origin recorded in the manifest. Initial loopback-HTTP tests returned error 150 for many sources that play successfully with the actual HTTPS site referrer. Do not interpret a loopback-only failure as global embed refusal. `scripts/check-youtube-live-browser.mjs` serves the local `dist` build inside an isolated test browser at `PUBLIC_ORIGIN` (defaulting to the recorded SCRATCH origin), without publishing or modifying the remote site. It checks real Play/Pause for all 43 poem tracks plus the fragment, no Spotify downloads, and the About email.
