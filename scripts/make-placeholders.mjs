import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const W = 1200;
const H = 1500;
const outDir = path.resolve('src/assets/puisi');

await mkdir(outDir, { recursive: true });

// Small deterministic PRNG so the placeholder set is reproducible.
let seed = 20261024;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function grainBuffer(width, height, alpha = 34) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const value = 88 + Math.floor(rand() * 96);
    const offset = i * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = alpha;
  }
  return data;
}

const vignette = `
  <radialGradient id="vig" cx="50%" cy="44%" r="78%">
    <stop offset="58%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".42"/>
  </radialGradient>
`;

const images = [
  {
    name: 'kamar',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stop-color="#25211c"/>
          <stop offset=".55" stop-color="#171512"/>
          <stop offset="1" stop-color="#0d0c0b"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="54"/></filter>
        <filter id="softer" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="120"/></filter>
        ${vignette}
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)"/>
      <g filter="url(#softer)">
        <ellipse cx="345" cy="690" rx="300" ry="500" fill="#4b3926" opacity=".65"/>
        <ellipse cx="880" cy="1120" rx="420" ry="240" fill="#080807" opacity=".9"/>
      </g>
      <g filter="url(#soft)" opacity=".8">
        <rect x="690" y="95" width="268" height="1110" rx="6" fill="#c9a368" transform="rotate(5.5 824 650)"/>
        <rect x="770" y="300" width="80" height="740" fill="#e6cda0" opacity=".5" transform="rotate(5.5 810 670)"/>
      </g>
      <path d="M 180 1168 C 420 1130, 760 1120, 1018 1092" fill="none" stroke="#963b27" stroke-width="3" opacity=".8"/>
      <rect width="1200" height="1500" fill="url(#vig)"/>
    </svg>`,
  },
  {
    name: 'hujan',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0" stop-color="#8c969b"/>
          <stop offset=".52" stop-color="#657177"/>
          <stop offset="1" stop-color="#3b4447"/>
        </linearGradient>
        <filter id="mist" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="80"/></filter>
        <filter id="rain" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.5"/></filter>
        ${vignette}
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)"/>
      <g filter="url(#mist)">
        <ellipse cx="250" cy="260" rx="420" ry="300" fill="#c4cbcd" opacity=".45"/>
        <ellipse cx="1040" cy="900" rx="500" ry="540" fill="#2e383a" opacity=".5"/>
      </g>
      <g stroke="#dfe5e5" stroke-linecap="round" filter="url(#rain)">
        ${Array.from({ length: 46 }, () => {
          const x = 60 + rand() * 1120;
          const y = 120 + rand() * 1200;
          const len = 90 + rand() * 260;
          const slant = 22 + rand() * 20;
          return `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - slant).toFixed(0)}" y2="${(y + len).toFixed(0)}" stroke-width="${(0.7 + rand() * 2).toFixed(1)}" opacity="${(0.06 + rand() * 0.22).toFixed(2)}"/>`;
        }).join('')}
      </g>
      <circle cx="912" cy="342" r="74" fill="#a95335" opacity=".82"/>
      <rect width="1200" height="1500" fill="url(#vig)"/>
    </svg>`,
  },
  {
    name: 'meja',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1=".1" y1="0" x2=".9" y2="1">
          <stop offset="0" stop-color="#cabb a4"/>
          <stop offset=".48" stop-color="#b09d84"/>
          <stop offset="1" stop-color="#8e7b64"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="36"/></filter>
        <filter id="hard" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
        ${vignette}
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)"/>
      <g filter="url(#soft)" opacity=".6">
        <ellipse cx="370" cy="650" rx="330" ry="300" fill="#e4dac7"/>
        <ellipse cx="810" cy="905" rx="350" ry="310" fill="#7d6a54"/>
      </g>
      <g opacity=".9">
        <circle cx="408" cy="640" r="248" fill="#ded3c0" stroke="#f2e9d9" stroke-width="3"/>
        <circle cx="408" cy="640" r="196" fill="none" stroke="#b5a68f" stroke-width="2" opacity=".7"/>
        <circle cx="806" cy="915" r="250" fill="#c2b29b" stroke="#eee3d1" stroke-width="3"/>
        <circle cx="806" cy="915" r="198" fill="none" stroke="#937f66" stroke-width="2" opacity=".6"/>
        <ellipse cx="790" cy="1088" rx="300" ry="90" fill="#5d4d3c" opacity=".28" filter="url(#soft)"/>
      </g>
      <g filter="url(#hard)">
        <path d="M 92 1290 C 380 1210, 720 1010, 1108 842" fill="none" stroke="#a43f2c" stroke-width="4" opacity=".85"/>
        <path d="M 130 1350 C 420 1268, 760 1068, 1120 906" fill="none" stroke="#a43f2c" stroke-width="2" opacity=".4"/>
      </g>
      <rect width="1200" height="1500" fill="url(#vig)"/>
    </svg>`.replace('#cabb a4', '#c9ba9f'),
  },
  {
    name: 'dapur',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2=".4" y2="1">
          <stop offset="0" stop-color="#2a221b"/>
          <stop offset=".6" stop-color="#3c2e22"/>
          <stop offset="1" stop-color="#17120e"/>
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f0bd72"/>
          <stop offset=".65" stop-color="#c98745"/>
          <stop offset="1" stop-color="#8e582e"/>
        </linearGradient>
        <filter id="soft" x="-40%" y="-30%" width="180%" height="170%"><feGaussianBlur stdDeviation="46"/></filter>
        <filter id="verysoft" x="-60%" y="-40%" width="220%" height="190%"><feGaussianBlur stdDeviation="120"/></filter>
        ${vignette}
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)"/>
      <g filter="url(#verysoft)" opacity=".7">
        <ellipse cx="845" cy="720" rx="380" ry="520" fill="#b06f38"/>
      </g>
      <g filter="url(#soft)">
        <path d="M 615 1240 L 615 560 Q 615 360 835 360 Q 1055 360 1055 560 L 1055 1240 Z" fill="url(#glow)" opacity=".85"/>
        <rect x="700" y="520" width="270" height="720" fill="#f4d49a" opacity=".4"/>
      </g>
      <g filter="url(#soft)" opacity=".9">
        <ellipse cx="294" cy="1126" rx="118" ry="50" fill="#6b94a1"/>
        <path d="M 294 1030 Q 250 1120 294 1148 Q 336 1120 294 1030 Z" fill="#dfe9e3" opacity=".8"/>
      </g>
      <path d="M 0 1370 L 1200 1318" stroke="#0b0907" stroke-width="120" opacity=".42" filter="url(#soft)"/>
      <rect width="1200" height="1500" fill="url(#vig)"/>
    </svg>`,
  },
  {
    name: 'sepatu',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1=".2" x2="1" y2=".8">
          <stop offset="0" stop-color="#4d5047"/>
          <stop offset=".55" stop-color="#65675c"/>
          <stop offset="1" stop-color="#34362f"/>
        </linearGradient>
        <radialGradient id="door" cx="50%" cy="46%" r="50%">
          <stop offset="0" stop-color="#dfd3b8" stop-opacity=".92"/>
          <stop offset=".55" stop-color="#b6a98d" stop-opacity=".5"/>
          <stop offset="1" stop-color="#6f6c5c" stop-opacity="0"/>
        </radialGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="42"/></filter>
        <filter id="verysoft" x="-60%" y="-40%" width="220%" height="180%"><feGaussianBlur stdDeviation="120"/></filter>
        ${vignette}
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)"/>
      <g filter="url(#verysoft)">
        <ellipse cx="610" cy="620" rx="300" ry="480" fill="#d8caa9" opacity=".5"/>
        <path d="M 0 0 L 390 0 L 530 1500 L 0 1500 Z" fill="#191b17" opacity=".62"/>
        <path d="M 1200 0 L 820 0 L 700 1500 L 1200 1500 Z" fill="#191b17" opacity=".55"/>
      </g>
      <g filter="url(#soft)">
        <rect x="502" y="240" width="196" height="760" rx="14" fill="url(#door)" opacity=".8"/>
      </g>
      <path d="M 420 1450 L 780 1450" stroke="#a0462f" stroke-width="4" opacity=".65" filter="url(#soft)"/>
      <g opacity=".85">
        <ellipse cx="512" cy="1282" rx="138" ry="58" fill="#1b1a17" transform="rotate(-8 512 1282)"/>
        <path d="M 392 1276 Q 430 1190 520 1212 L 642 1250 Q 610 1301 530 1303 Z" fill="#262521" transform="rotate(-8 512 1272)"/>
        <ellipse cx="670" cy="1320" rx="92" ry="34" fill="#171613" opacity=".7" filter="url(#soft)"/>
      </g>
      <rect width="1200" height="1500" fill="url(#vig)"/>
    </svg>`,
  },
  {
    name: 'sisa',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stop-color="#d6c3a8"/>
          <stop offset=".5" stop-color="#b09a7d"/>
          <stop offset="1" stop-color="#77634f"/>
        </linearGradient>
        <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f6e2be" stop-opacity=".9"/>
          <stop offset="1" stop-color="#f6e2be" stop-opacity="0"/>
        </linearGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="48"/></filter>
        ${vignette}
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)"/>
      <g filter="url(#soft)">
        <path d="M -80 180 L 720 -80 L 1120 420 L 180 860 Z" fill="url(#light)" opacity=".72"/>
        <circle cx="880" cy="1010" r="210" fill="#a34a32" opacity=".5"/>
        <rect x="0" y="1060" width="1200" height="440" fill="#3e3228" opacity=".36"/>
      </g>
      <g filter="url(#soft)" opacity=".55">
        <ellipse cx="478" cy="1086" rx="250" ry="66" fill="#3b2e24"/>
      </g>
      <g fill="none" stroke="#eadbc2" opacity=".75" filter="url(#soft)">
        <ellipse cx="470" cy="1010" rx="132" ry="26" stroke-width="3"/>
        <ellipse cx="470" cy="1010" rx="98" ry="18" stroke-width="2" opacity=".55"/>
      </g>
      <path d="M 760 1330 C 880 1200, 1010 1160, 1120 1180" fill="none" stroke="#8f3b28" stroke-width="2" opacity=".5"/>
      <rect width="1200" height="1500" fill="url(#vig)"/>
    </svg>`,
  },
];

for (const image of images) {
  const base = sharp(Buffer.from(image.svg));
  const grained = await base
    .composite([
      {
        input: grainBuffer(W, H),
        raw: { width: W, height: H, channels: 4 },
        blend: 'soft-light',
      },
    ])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  await writeFile(path.join(outDir, `${image.name}.jpg`), grained);
  console.log(`made ${image.name}.jpg`);
}
