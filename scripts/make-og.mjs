import sharp from 'sharp';

// Fallback OG image. The shipped `public/og.jpg` is a 1200×630 screenshot of
// the real intro; this script is here if you want to regenerate a lightweight
// version without opening a browser.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="20%" cy="10%" r="90%">
      <stop offset="0" stop-color="#f7f1e5"/>
      <stop offset="1" stop-color="#e8e2d5"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="60" y="52" width="14" height="14" fill="none" stroke="#171512" stroke-width="1.5"/>
  <path d="M55 89 L87 56" stroke="#a23d27" stroke-width="3" stroke-linecap="round"/>
  <text x="98" y="70" fill="#5c564a" font-family="DejaVu Sans, sans-serif" font-size="15" letter-spacing="4">ARSIP PUISI PRIBADI</text>
  <text x="58" y="392" fill="#171512" font-family="DejaVu Serif, Georgia, serif" font-size="256" letter-spacing="-11">SCRATCH</text>
  <path d="M62 430 C 250 420, 430 438, 610 428 C 760 420, 860 426, 930 430" fill="none" stroke="#a23d27" stroke-width="4" stroke-linecap="round"/>
  <text x="62" y="512" fill="#5c564a" font-family="DejaVu Serif, Georgia, serif" font-style="italic" font-size="27">Puisi, gambar, dan yang tersisa.</text>
  <circle cx="1060" cy="322" r="72" fill="none" stroke="#171512" stroke-width="1.5"/>
  <path d="M1034 348 L1086 296 M1052 296 L1086 296 L1086 330" fill="none" stroke="#171512" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile('public/og.jpg');
console.log('made public/og.jpg');
