import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import sharp from 'sharp';
import {parseManuscript} from '../scripts/import-poems.mjs';

test('refraction retains all 40 source poems and artwork after adding recursion', async () => {
  const source = await readFile(new URL('../content-source/arsip-cahaya-yang-salah-arah.txt', import.meta.url), 'utf8');
  const poems = parseManuscript(source);
  assert.deepEqual(poems.map(p => p.title), ['HALAMAN NOL', 'GRAFIT', 'KAMBIUM', 'CO-OP', 'POSTULAT', 'ANOTASI', 'TANDA BACA', 'KONTUR', 'BLUESHIFT', 'SELA', 'PARALAKS', 'FOSFOR', 'LAGU TITIPAN', 'NEGATIVE SPACE', 'ANAMORFOSIS', 'INDEKS BIAS', '09.06', 'THE COMPARATIVE', 'CUACA PALSU', 'FASE LATEN', 'AMBANG', 'KUCING YANG MENGANGKAT TANGAN', 'JALAN YANG BAIK', '01.23', 'THE WEATHER I WITHHELD', 'THE LONGEST TIME', 'HEWAN KECIL DI ANTARA DUA LAYAR', 'SEMOGA DIPERMUDAH', 'TANGAN YANG BELUM PERGI', 'ENUMERASI', 'TAK TERPIKIR', 'DUA CARA MENUNDUK', 'READ RECEIPT', 'HISTERESIS', 'UNSENT LETTER TO A SEASON', 'PALIMSEST', 'ALBEDO', 'PINTU SELATAN', 'LAST COORDINATES', 'KATALOG BENDA YANG TAK JADI']);
  const content = new URL('../src/content/puisi/', import.meta.url);
  const images = new URL('../src/assets/puisi/', import.meta.url);
  assert.equal((await readdir(content)).filter(n => n.endsWith('.md')).length, 46);
  assert.equal((await readdir(images)).filter(n => /\.(webp|jpg|png)$/.test(n)).length, 46);
  for (const poem of poems) {
    const markdown = await readFile(new URL(`${poem.slug}.md`, content), 'utf8');
    const [, frontmatter, body] = markdown.split('---\n');
    assert.equal(body.trim(), poem.body, `${poem.title}: source lines and stanza breaks`);
    assert.match(frontmatter, new RegExp(`^order: ${poem.order}$`, 'm'));
    assert.ok(!/[—:]/.test(body), `${poem.title}: punctuation matches source edition`);
    assert.ok(frontmatter.includes(`../../assets/puisi/${poem.slug}.webp`));
    const image = await sharp(await readFile(new URL(`${poem.slug}.webp`, images))).metadata();
    assert.deepEqual([image.width, image.height, image.format], [1200, 1500, 'webp']);
  }
});

test('recursion contains six complete source poems with separate numbered series membership and new artwork', async () => {
  const poems = parseManuscript(await readFile(new URL('../content-source/recursion.txt', import.meta.url), 'utf8'));
  assert.deepEqual(poems.map(p=>p.title), ['RUANG BISING','SEBUAH NAMA','HUKUM NEWTON','PI','ROTASI','NORMAL']);
  const series=await readFile(new URL('../src/content/series/recursion.md', import.meta.url), 'utf8');
  assert.match(series, /^title: "recursion"$/m);
  assert.deepEqual([...series.matchAll(/^  - (.+)$/gm)].map(m=>m[1]), ['ruang-bising','sebuah-nama','hukum-newton','pi','rotasi','normal']);
  for(const poem of poems) {
    const markdown=await readFile(new URL(`../src/content/puisi/${poem.slug}.md`,import.meta.url),'utf8');
    const [,frontmatter,body]=markdown.split('---\n');
    assert.equal(body.trim(),poem.body,`${poem.title}: preserve every original stanza and line`);
    assert.match(frontmatter,new RegExp(`^order: ${40+poem.order}$`,'m'));
    const image=await sharp(await readFile(new URL(`../src/assets/puisi/${poem.slug}.webp`,import.meta.url))).metadata();
    assert.deepEqual([image.width,image.height,image.format],[1200,1500,'webp']);
  }
  const cover=await sharp(await readFile(new URL('../src/assets/series/recursion.webp',import.meta.url))).metadata();
  assert.deepEqual([cover.width,cover.height,cover.format],[1200,1500,'webp']);
});

test('the original eight soundtrack selections remain unchanged', async () => {
  const expected=[
    ['halaman-nol','4R2kfaDFhslZEMJqAFNpdd','cardigan','Taylor Swift'],
    ['kontur','2AwUbBYWlFX2VjP4wTiUI2','Dan Bandung (feat. Danilla)','The Panasdalam Bank, Danilla'],
    ['ambang','2JcLhDcdmV8ZZ7aTvyIp6s','Before','NIKI'],
    ['the-weather-i-withheld','3zOYmiNOuyDL0ClxJcEJ0T','Stop The Wedding!','Ashe'],
    ['the-longest-time','4R2kfaDFhslZEMJqAFNpdd','cardigan','Taylor Swift'],
    ['katalog-benda-yang-tak-jadi','0x7PmByJWVXdeipevd6KZS','Take A Chance With Me','NIKI'],
    ['sebuah-nama','1fDFHXcykq4iw8Gg7s5hG9','About You','The 1975'],
    ['pi','5Htq8DDDN0Xce9MwqzAzui','La La Lost You','88rising, NIKI'],
  ];
  for(const [slug,id,title,artist]of expected) {
    const markdown=await readFile(new URL(`../src/content/puisi/${slug}.md`,import.meta.url),'utf8');
    assert.ok(markdown.includes(`trackId: "${id}"`),slug);
    assert.ok(markdown.includes(`  title: "${title}"`),slug);
    assert.ok(markdown.includes(`  artist: "${artist}"`),slug);
  }
});
