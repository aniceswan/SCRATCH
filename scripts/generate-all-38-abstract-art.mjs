import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const W = 1200;
const H = 1500;
const outDir = path.resolve('src/assets/puisi');
await mkdir(outDir, { recursive: true });

let seed = 20261025;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function grainBuffer(width, height, alpha = 36) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const value = 85 + Math.floor(rand() * 100);
    const offset = i * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = alpha;
  }
  return data;
}

const vignette = `
  <radialGradient id="vig" cx="50%" cy="46%" r="76%">
    <stop offset="60%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#050403" stop-opacity=".48"/>
  </radialGradient>
`;

const aiImages = {
  'grafit': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_01_grafit_1792888252496.jpg',
  'kambium': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_02_kambium_1792888265676.jpg',
  'co-op': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_03_co_op_1792888283967.jpg',
  'kontur': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_07_kontur_1792888261179.jpg',
  'blueshift': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_08_blueshift_1792888276480.jpg',
  'negative-space': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_13_negative_space_1792888268084.jpg',
  'anamorfosis': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_14_anamorfosis_1792888284799.jpg',
  'indeks-bias': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_15_indeks_bias_1792888299387.jpg',
  'fase-laten': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_19_fase_laten_1792888273297.jpg',
  'ambang': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_20_ambang_1792888288141.jpg',
  'hewan-kecil-di-antara-dua-layar': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_25_hewan_kecil_1792888280492.jpg',
  'histeresis': '/home/angsabaik/.gemini/antigravity-cli/brain/9fadea72-6101-4d6c-8477-f6b201826d74/poem_32_histeresis_1792888286404.jpg',
};

// Procedural abstract designs tailored to each poem
const proceduralSvgs = {
  'postulat': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f0ebe1"/><stop offset="50%" stop-color="#e3dacb"/><stop offset="100%" stop-color="#c9bca6"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".85">
        <path d="M 280 1150 A 550 550 0 0 1 920 380" fill="none" stroke="#b38742" stroke-width="3" stroke-dasharray="14 10"/>
        <line x1="280" y1="1150" x2="920" y2="380" stroke="#2b2620" stroke-width="2.5" opacity=".7"/>
        <circle cx="280" cy="1150" r="14" fill="#2b2620"/>
        <circle cx="280" cy="1150" r="28" fill="none" stroke="#2b2620" stroke-width="1.5" opacity=".4"/>
        <circle cx="920" cy="380" r="14" fill="#b38742"/>
        <circle cx="920" cy="380" r="32" fill="none" stroke="#b38742" stroke-width="1.5" opacity=".5"/>
        <path d="M 600 765 A 180 180 0 0 0 680 820" fill="none" stroke="#7a3424" stroke-width="2" opacity=".6"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'anotasi': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0%" stop-color="#f7f2e7"/><stop offset="60%" stop-color="#ebdcc5"/><stop offset="100%" stop-color="#cfbca0"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="35"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".8">
        <circle cx="780" cy="520" r="210" fill="none" stroke="#221e1a" stroke-width="22" stroke-linecap="round" stroke-dasharray="880 120" transform="rotate(-30 780 520)"/>
        <path d="M 420 400 Q 320 750 420 1100" fill="none" stroke="#943926" stroke-width="6" stroke-linecap="round" opacity=".7"/>
        <circle cx="780" cy="520" r="8" fill="#943926"/>
        <circle cx="780" cy="480" r="4" fill="#221e1a"/>
        <circle cx="820" cy="520" r="4" fill="#221e1a"/>
        <circle cx="780" cy="560" r="4" fill="#221e1a"/>
        <circle cx="740" cy="520" r="4" fill="#221e1a"/>
        <line x1="240" y1="980" x2="680" y2="980" stroke="#635747" stroke-width="1.5" opacity=".5"/>
        <line x1="240" y1="1040" x2="520" y2="1040" stroke="#635747" stroke-width="1.5" opacity=".35"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'tanda-baca': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f5efe6"/><stop offset="100%" stop-color="#ded3c1"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="20"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".88">
        <ellipse cx="600" cy="460" rx="90" ry="86" fill="#181512"/>
        <path d="M 600 780 C 650 780 690 820 690 880 C 690 1020 520 1160 440 1230 C 500 1150 580 1040 580 940 C 580 900 560 880 540 880 C 510 880 490 900 490 930 C 490 850 540 780 600 780 Z" fill="#181512"/>
        <circle cx="600" cy="460" r="140" fill="none" stroke="#ad472e" stroke-width="2" opacity=".4"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'sela': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#191714"/><stop offset="50%" stop-color="#12100d"/><stop offset="100%" stop-color="#080706"/>
        </linearGradient>
        <linearGradient id="slit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fbe4b2" stop-opacity="0"/><stop offset="50%" stop-color="#fce9c0" stop-opacity=".95"/><stop offset="100%" stop-color="#fbe4b2" stop-opacity="0"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="60"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect x="575" y="0" width="50" height="${H}" fill="url(#slit)" filter="url(#glow)" opacity=".8"/>
      <rect x="594" y="0" width="12" height="${H}" fill="#fff4d4" opacity=".9"/>
      <ellipse cx="600" cy="980" rx="340" ry="120" fill="#d99938" opacity=".22" filter="url(#glow)"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'paralaks': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#242c2d"/><stop offset="60%" stop-color="#161c1d"/><stop offset="100%" stop-color="#0e1213"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="25"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".85">
        <rect x="220" y="320" width="520" height="740" rx="8" fill="#3c5756" opacity=".55"/>
        <rect x="460" y="440" width="520" height="740" rx="8" fill="#e8ded0" opacity=".65"/>
        <rect x="460" y="440" width="280" height="620" fill="#2d3d3c" opacity=".4"/>
        <line x1="220" y1="320" x2="460" y2="440" stroke="#c9873e" stroke-width="2.5" opacity=".8"/>
        <line x1="740" y1="1060" x2="980" y2="1180" stroke="#c9873e" stroke-width="2.5" opacity=".8"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'fosfor': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#151b14"/><stop offset="60%" stop-color="#0f140f"/><stop offset="100%" stop-color="#070907"/>
        </linearGradient>
        <radialGradient id="glow" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#a3de71" stop-opacity=".9"/><stop offset="40%" stop-color="#6ba647" stop-opacity=".4"/><stop offset="100%" stop-color="#151b14" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="80"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <ellipse cx="540" cy="580" rx="380" ry="460" fill="url(#glow)" filter="url(#blur)" opacity=".75"/>
      <circle cx="520" cy="550" r="110" fill="#c4f294" opacity=".6" filter="url(#blur)"/>
      <g fill="#c9f29b" opacity=".65">
        <circle cx="480" cy="520" r="3"/><circle cx="560" cy="480" r="4"/><circle cx="510" cy="620" r="2.5"/><circle cx="620" cy="590" r="3.5"/><circle cx="430" cy="590" r="2"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'lagu-titipan': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e8ded2"/><stop offset="50%" stop-color="#d4c3b0"/><stop offset="100%" stop-color="#b09b84"/>
        </linearGradient>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".8" stroke-linecap="round">
        <path d="M 120 550 Q 380 320 600 550 T 1080 550" fill="none" stroke="#9c422b" stroke-width="3"/>
        <path d="M 120 670 Q 380 440 600 670 T 1080 670" fill="none" stroke="#2b231c" stroke-width="2.5"/>
        <path d="M 120 790 Q 380 560 600 790 T 1080 790" fill="none" stroke="#9c422b" stroke-width="2" opacity=".7"/>
        <path d="M 120 910 Q 380 680 600 910 T 1080 910" fill="none" stroke="#b38742" stroke-width="3" opacity=".75"/>
        <path d="M 120 1030 Q 380 800 600 1030 T 1080 1030" fill="none" stroke="#2b231c" stroke-width="1.5" opacity=".5"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  '09-06': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f1b18"/><stop offset="68%" stop-color="#12100e"/><stop offset="70%" stop-color="#e8dcc8"/><stop offset="100%" stop-color="#cbb89e"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect x="0" y="1030" width="${W}" height="24" fill="#080706"/>
      <rect x="360" y="1042" width="480" height="120" fill="#f5eee2" opacity=".95" filter="url(#soft)"/>
      <rect x="420" y="980" width="360" height="180" rx="4" fill="#fdfbf7" opacity=".9" transform="rotate(-4 600 1070)"/>
      <line x1="450" y1="1025" x2="730" y2="1005" stroke="#b08b52" stroke-width="2" opacity=".6"/>
      <line x1="450" y1="1065" x2="680" y2="1048" stroke="#756450" stroke-width="2" opacity=".4"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'the-comparative': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#eee6d8"/><stop offset="60%" stop-color="#ddd1be"/><stop offset="100%" stop-color="#beaea0"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".85">
        <line x1="280" y1="620" x2="920" y2="760" stroke="#26211a" stroke-width="4"/>
        <polygon points="600,690 560,940 640,940" fill="#26211a"/>
        <line x1="280" y1="620" x2="280" y2="780" stroke="#a67c42" stroke-width="2"/>
        <rect x="200" y="780" width="160" height="160" rx="8" fill="#a67c42"/>
        <line x1="920" y1="760" x2="920" y2="920" stroke="#8c8072" stroke-width="2" stroke-dasharray="6 6"/>
        <circle cx="920" cy="1000" r="80" fill="none" stroke="#8c8072" stroke-width="2.5" stroke-dasharray="8 8"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'cuaca-palsu': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#404c50"/><stop offset="50%" stop-color="#2a3336"/><stop offset="100%" stop-color="#161c1e"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stop-color="#d4924c" stop-opacity=".7"/><stop offset="100%" stop-color="#d4924c" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="50"/></filter>
        <filter id="streaks" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <ellipse cx="600" cy="520" rx="420" ry="380" fill="url(#glow)" filter="url(#blur)"/>
      <g stroke="#cfd7d9" stroke-linecap="round" filter="url(#streaks)" opacity=".6">
        <line x1="260" y1="200" x2="260" y2="1200" stroke-width="3" opacity=".5"/>
        <line x1="420" y1="350" x2="420" y2="1350" stroke-width="4" opacity=".6"/>
        <line x1="580" y1="150" x2="580" y2="1280" stroke-width="2.5" opacity=".4"/>
        <line x1="740" y1="280" x2="740" y2="1400" stroke-width="3.5" opacity=".7"/>
        <line x1="900" y1="220" x2="900" y2="1150" stroke-width="2" opacity=".4"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'kucing-yang-mengangkat-tangan': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#364e52"/><stop offset="50%" stop-color="#233538"/><stop offset="100%" stop-color="#142124"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".9">
        <circle cx="600" cy="850" r="280" fill="#b85735"/>
        <path d="M 720 700 C 820 540 850 420 810 360 C 760 300 680 400 650 520" fill="none" stroke="#d49c48" stroke-width="38" stroke-linecap="round"/>
        <polygon points="420,640 480,500 560,610" fill="#8c3a20"/>
        <polygon points="660,610 740,500 780,640" fill="#8c3a20"/>
        <circle cx="600" cy="850" r="160" fill="#d9cbb2" opacity=".4" filter="url(#soft)"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'jalan-yang-baik': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2b3b32"/><stop offset="50%" stop-color="#1c2621"/><stop offset="100%" stop-color="#0f1612"/>
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#e3b668" stop-opacity=".7"/><stop offset="100%" stop-color="#e3b668" stop-opacity="0"/>
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="60"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <circle cx="600" cy="400" r="280" fill="url(#sun)" filter="url(#soft)"/>
      <g fill="none" stroke-linecap="round">
        <path d="M 600 1500 C 600 1100 520 900 240 680" stroke="#d9b172" stroke-width="18" opacity=".85"/>
        <path d="M 600 1500 C 600 1100 680 900 960 680" stroke="#e8dfd1" stroke-width="18" opacity=".75"/>
      </g>
      <circle cx="600" cy="1080" r="14" fill="#a8432a"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  '01-23': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#181519"/><stop offset="50%" stop-color="#0f0c10"/><stop offset="100%" stop-color="#050406"/>
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g stroke="#1a141a" stroke-width="3">
        <polygon points="600,750 320,400 780,280" fill="#2d222b"/>
        <polygon points="600,750 880,520 1020,860" fill="#221921"/>
        <polygon points="600,750 780,1180 340,1100" fill="#362934"/>
        <polygon points="600,750 180,920 160,560" fill="#291f28"/>
      </g>
      <path d="M 320 400 L 600 750 L 780 1180 M 600 750 L 1020 860" fill="none" stroke="#d63124" stroke-width="6" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M 320 400 L 600 750 L 780 1180 M 600 750 L 1020 860" fill="none" stroke="#ff857a" stroke-width="2" stroke-linecap="round"/>
      <circle cx="600" cy="750" r="9" fill="#ffefed"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'the-longest-time': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#181e2b"/><stop offset="50%" stop-color="#0e131d"/><stop offset="100%" stop-color="#06090e"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g fill="none" stroke="#7e9ac2" stroke-linecap="round" opacity=".75">
        <circle cx="600" cy="750" r="100" stroke-width="4"/>
        <circle cx="600" cy="750" r="220" stroke-width="3" opacity=".7"/>
        <circle cx="600" cy="750" r="360" stroke-width="2.5" opacity=".5"/>
        <circle cx="600" cy="750" r="510" stroke-width="2" opacity=".35"/>
        <circle cx="600" cy="750" r="670" stroke-width="1.5" opacity=".2"/>
      </g>
      <circle cx="600" cy="750" r="18" fill="#d8e5f7"/>
      <circle cx="600" cy="750" r="45" fill="#a4c2ed" opacity=".4" filter="url(#soft)"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'semoga-dipermudah': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e9ebe1"/><stop offset="60%" stop-color="#d6dad0"/><stop offset="100%" stop-color="#b6beb0"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".85">
        <path d="M 320 1100 Q 420 540 820 460 Q 640 840 880 1100" fill="none" stroke="#5d7362" stroke-width="12" stroke-linecap="round"/>
        <path d="M 320 1100 Q 560 740 880 1100" fill="#a3b8a8" opacity=".35" filter="url(#soft)"/>
        <line x1="160" y1="1100" x2="1040" y2="1100" stroke="#4a574d" stroke-width="3"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'tangan-yang-belum-pergi': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#241e1b"/><stop offset="60%" stop-color="#161210"/><stop offset="100%" stop-color="#0a0807"/>
        </linearGradient>
        <radialGradient id="lamp" cx="82%" cy="45%" r="45%">
          <stop offset="0%" stop-color="#ffb852" stop-opacity=".85"/><stop offset="40%" stop-color="#d47d28" stop-opacity=".4"/><stop offset="100%" stop-color="#241e1b" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="70"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <circle cx="920" cy="650" r="320" fill="url(#lamp)" filter="url(#glow)"/>
      <path d="M 880 650 Q 520 620 220 920" fill="none" stroke="#e8ded4" stroke-width="16" stroke-linecap="round" opacity=".8"/>
      <path d="M 880 650 Q 620 650 340 1060" fill="none" stroke="#9e8574" stroke-width="8" stroke-linecap="round" opacity=".5"/>
      <circle cx="880" cy="650" r="14" fill="#fff1db"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'enumerasi': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#eee7db"/><stop offset="50%" stop-color="#dfd6c4"/><stop offset="100%" stop-color="#c1b59f"/>
        </linearGradient>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g stroke="#26211c" stroke-linecap="round" opacity=".85">
        <line x1="380" y1="520" x2="380" y2="980" stroke-width="8"/>
        <line x1="480" y1="520" x2="480" y2="980" stroke-width="8"/>
        <line x1="580" y1="520" x2="580" y2="980" stroke-width="8"/>
        <line x1="680" y1="520" x2="680" y2="980" stroke-width="8"/>
        <line x1="320" y1="920" x2="740" y2="580" stroke="#a33d26" stroke-width="10"/>
      </g>
      <circle cx="530" cy="1160" r="90" fill="none" stroke="#786a56" stroke-width="2.5" opacity=".6"/>
      <circle cx="530" cy="1160" r="160" fill="none" stroke="#786a56" stroke-width="1.5" opacity=".35"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'tak-terpikir': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4d8d9"/><stop offset="50%" stop-color="#bcc3c5"/><stop offset="100%" stop-color="#9ea7aa"/>
        </linearGradient>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <path d="M 180 1200 Q 340 700 480 880 T 780 540 T 1020 360" fill="none" stroke="#222729" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      <path d="M 180 1200 Q 420 1020 620 980 T 890 840" fill="none" stroke="#874735" stroke-width="3" stroke-dasharray="8 8" opacity=".6"/>
      <circle cx="180" cy="1200" r="10" fill="#222729"/>
      <circle cx="1020" cy="360" r="8" fill="#874735"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'dua-cara-menunduk': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e3ded6"/><stop offset="50%" stop-color="#cfc7bc"/><stop offset="100%" stop-color="#b0a79a"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".85">
        <path d="M 280 1150 C 280 720 480 620 560 620" fill="none" stroke="#2b2724" stroke-width="16" stroke-linecap="round"/>
        <path d="M 920 1150 C 920 720 720 620 640 620" fill="none" stroke="#875743" stroke-width="16" stroke-linecap="round"/>
        <line x1="560" y1="740" x2="640" y2="740" stroke="#bda58c" stroke-width="4"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'read-receipt': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#28222e"/><stop offset="50%" stop-color="#19151e"/><stop offset="100%" stop-color="#0c090f"/>
        </linearGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".85">
        <path d="M 600 820 C 520 740 440 640 440 540 C 440 440 520 380 600 460 C 680 380 760 440 760 540 C 760 640 680 740 600 820 Z" fill="none" stroke="#c97187" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="560" cy="1000" r="14" fill="#7ba5db" filter="url(#glow)"/>
        <circle cx="640" cy="1000" r="14" fill="#7ba5db" filter="url(#glow)"/>
        <circle cx="560" cy="1000" r="7" fill="#ffffff"/>
        <circle cx="640" cy="1000" r="7" fill="#ffffff"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'unsent-letter-to-a-season': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d6b896"/><stop offset="50%" stop-color="#aa866a"/><stop offset="100%" stop-color="#694b39"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="50"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".75">
        <ellipse cx="440" cy="620" rx="280" ry="380" fill="#f0dbbe" opacity=".5" filter="url(#soft)"/>
        <rect x="340" y="440" width="520" height="660" rx="6" fill="#fdf7ed" opacity=".7" transform="rotate(7 600 770)"/>
        <line x1="390" y1="550" x2="780" y2="600" stroke="#96432b" stroke-width="2.5" opacity=".7"/>
        <line x1="390" y1="620" x2="740" y2="665" stroke="#4a3627" stroke-width="2" opacity=".5"/>
        <line x1="390" y1="690" x2="700" y2="730" stroke="#4a3627" stroke-width="2" opacity=".5"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'palimsest': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2=".5" y2="1">
          <stop offset="0%" stop-color="#e8decb"/><stop offset="50%" stop-color="#cfbe9f"/><stop offset="100%" stop-color="#9e8a67"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g opacity=".8">
        <path d="M 220 380 Q 600 320 980 420" stroke="#873522" stroke-width="6" opacity=".5"/>
        <path d="M 220 520 Q 600 480 980 560" stroke="#262119" stroke-width="8" opacity=".7"/>
        <path d="M 220 660 Q 600 620 980 700" stroke="#873522" stroke-width="5" opacity=".4"/>
        <path d="M 220 800 Q 600 760 980 840" stroke="#262119" stroke-width="12" opacity=".8"/>
        <path d="M 220 940 Q 600 900 980 980" stroke="#262119" stroke-width="7" opacity=".6"/>
        <rect x="180" y="460" width="840" height="120" fill="#dfcfb4" opacity=".7" filter="url(#soft)"/>
        <rect x="240" y="740" width="720" height="140" fill="#dfcfb4" opacity=".8" filter="url(#soft)"/>
      </g>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'albedo': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#12141a"/><stop offset="50%" stop-color="#0a0b0f"/><stop offset="100%" stop-color="#030405"/>
        </linearGradient>
        <radialGradient id="moon" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fdfbf7"/><stop offset="50%" stop-color="#cfd4dd"/><stop offset="100%" stop-color="#464e5c"/>
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <circle cx="600" cy="720" r="320" fill="url(#moon)"/>
      <circle cx="700" cy="650" r="320" fill="#0a0b0f"/>
      <circle cx="540" cy="740" r="280" fill="none" stroke="#fdfbf7" stroke-width="2" opacity=".4" filter="url(#soft)"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'pintu-selatan': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1f2520"/><stop offset="50%" stop-color="#141815"/><stop offset="100%" stop-color="#0b0e0c"/>
        </linearGradient>
        <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f2cf7e" stop-opacity=".7"/><stop offset="100%" stop-color="#f2cf7e" stop-opacity="0"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="45"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <path d="M 0 0 L 520 0 L 1100 1500 L 400 1500 Z" fill="url(#ray)" filter="url(#soft)"/>
      <rect x="320" y="440" width="160" height="900" fill="#29302b"/>
      <rect x="720" y="440" width="160" height="900" fill="#29302b"/>
      <rect x="260" y="380" width="680" height="110" fill="#3b463f"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'last-coordinates': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#24303d"/><stop offset="50%" stop-color="#182029"/><stop offset="100%" stop-color="#0c1116"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g stroke="#6e859e" stroke-width="1.5" opacity=".6">
        <line x1="200" y1="0" x2="200" y2="${H}"/>
        <line x1="400" y1="0" x2="400" y2="${H}"/>
        <line x1="600" y1="0" x2="600" y2="${H}" stroke="#d49c48" stroke-width="2.5" opacity=".8"/>
        <line x1="800" y1="0" x2="800" y2="${H}"/>
        <line x1="1000" y1="0" x2="1000" y2="${H}"/>
        <line x1="0" y1="350" x2="${W}" y2="350"/>
        <line x1="0" y1="650" x2="${W}" y2="650"/>
        <line x1="0" y1="950" x2="${W}" y2="950" stroke="#d49c48" stroke-width="2.5" opacity=".8"/>
        <line x1="0" y1="1250" x2="${W}" y2="1250"/>
      </g>
      <circle cx="600" cy="950" r="14" fill="#a83c27"/>
      <circle cx="600" cy="950" r="48" fill="none" stroke="#d49c48" stroke-width="2" opacity=".7"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `,

  'katalog-benda-yang-tak-jadi': `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2a2622"/><stop offset="50%" stop-color="#1a1715"/><stop offset="100%" stop-color="#0c0a09"/>
        </linearGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
        ${vignette}
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <g stroke="#d4c3aa" stroke-width="2.5" fill="none" opacity=".8">
        <rect x="220" y="820" width="180" height="340"/>
        <polygon points="220,820 280,760 460,760 400,820"/>
        <polygon points="400,820 460,760 460,1100 400,1160"/>

        <rect x="510" y="680" width="180" height="480" stroke="#c48a47"/>
        <polygon points="510,680 570,620 750,620 690,680" stroke="#c48a47"/>
        <polygon points="690,680 750,620 750,1100 690,1160" stroke="#c48a47"/>

        <rect x="800" y="860" width="180" height="300"/>
        <polygon points="800,860 860,800 1040,800 980,860"/>
        <polygon points="980,860 1040,800 1040,1100 980,1160"/>
      </g>
      <ellipse cx="600" cy="1240" rx="480" ry="110" fill="#000" opacity=".5" filter="url(#soft)"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/>
    </svg>
  `
};

export async function generateAllArt(poems) {
  const artData = [];
  const grainRaw = grainBuffer(W, H, 36);

  for (const poem of poems) {
    const slug = poem.slug;
    const destWebp = path.join(outDir, `${slug}.webp`);
    let sourceUsed = '';

    if (aiImages[slug]) {
      try {
        const inputJpg = aiImages[slug];
        await sharp(inputJpg)
          .resize(W, H, { fit: 'cover' })
          .webp({ quality: 86 })
          .toFile(destWebp);
        sourceUsed = 'built-in ImageGen (AI abstract)';
        console.log(`[AI] ${slug}.webp processed from ${path.basename(inputJpg)}`);
      } catch (err) {
        console.warn(`[WARN] Failed to process AI image for ${slug}, falling back to procedural:`, err.message);
      }
    }

    if (!sourceUsed && proceduralSvgs[slug]) {
      const svg = proceduralSvgs[slug].trim();
      const base = sharp(Buffer.from(svg));
      await base
        .composite([
          {
            input: grainRaw,
            raw: { width: W, height: H, channels: 4 },
            blend: 'soft-light',
          },
        ])
        .webp({ quality: 86 })
        .toFile(destWebp);
      sourceUsed = 'procedural abstract fine-art';
      console.log(`[PROCEDURAL] ${slug}.webp generated`);
    }

    if (!sourceUsed) {
      throw new Error(`No art source available for ${slug}`);
    }

    artData.push({
      order: poem.order,
      slug: poem.slug,
      alt: `Komposisi visual abstrak untuk puisi ${poem.title}`,
      source: sourceUsed,
      width: W,
      height: H,
    });
  }

  await writeFile('scripts/poetry-art.json', JSON.stringify(artData, null, 2) + '\n');
  console.log(`Updated scripts/poetry-art.json with ${artData.length} abstract artworks.`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-all-38-abstract-art.mjs')) {
  import('./import-poems.mjs').then(async m => {
    const text = await readFile('content-source/arsip-cahaya-yang-salah-arah.txt', 'utf8');
    const poems = m.parseManuscript(text);
    await generateAllArt(poems);
  });
}
