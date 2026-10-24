import sharp from 'sharp';

// Fallback OG image. The shipped `public/og.jpg` is a 1200×630 screenshot of
// the real intro; this script is here if you want to regenerate a lightweight
// version without opening a browser.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0.72" y2="1">
      <stop offset="0" stop-color="#f3ecdf"/>
      <stop offset="0.44" stop-color="#e9e3d5"/>
      <stop offset="1" stop-color="#e0d6c5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#paper)"/>
  <path d="M62 84 C 74 66, 86 94, 100 80 C 112 68, 124 94, 138 78" fill="none" stroke="#171512" stroke-width="4" stroke-linecap="round"/>
  <text x="58" y="380" fill="#171512" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="200" letter-spacing="-4">scratch</text>
  <text x="890" y="205" fill="#a23d27" font-family="DejaVu Sans, sans-serif" font-size="44">*</text>
  <path d="M62 416 C 250 406, 430 424, 610 414 C 760 406, 860 412, 930 416" fill="none" stroke="#a23d27" stroke-width="4" stroke-linecap="round"/>
  <text x="62" y="486" fill="#5c564a" font-family="DejaVu Serif, Georgia, serif" font-style="italic" font-size="27">thought, regrets, and whatever remains</text>
  <circle cx="1030" cy="322" r="66" fill="none" stroke="#171512" stroke-width="1.5"/>
  <path d="M1006 346 L1054 298 M1022 298 L1054 298 L1054 330" fill="none" stroke="#171512" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile('public/og.jpg');
console.log('made public/og.jpg');
