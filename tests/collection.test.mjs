import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import sharp from 'sharp';
import {parseManuscript} from '../scripts/import-poems.mjs';

test('published collection contains the 24 source poems in manuscript order with matching artwork', async () => {
  const source = await readFile(new URL('../content-source/arsip-cahaya-yang-salah-arah.txt', import.meta.url), 'utf8');
  const poems = parseManuscript(source);
  assert.deepEqual(poems.map(p => p.title), ['GRAFIT', 'KAMBIUM', 'CO-OP', 'KONTUR', 'POSTULAT', 'SELA', 'ANOTASI', 'PARALAKS', 'BLUESHIFT', 'TANDA BACA', 'FOSFOR', 'LAGU TITIPAN', 'NEGATIVE SPACE', 'ENUMERASI', 'ANAMORFOSIS', 'HISTERESIS', 'FASE LATEN', 'INDEKS BIAS', 'UNSENT LETTER TO A SEASON', 'PALIMSEST', 'ALBEDO', 'PINTU SELATAN', 'LAST COORDINATES', 'KATALOG BENDA YANG TAK JADI']);
  const content = new URL('../src/content/puisi/', import.meta.url);
  const images = new URL('../src/assets/puisi/', import.meta.url);
  assert.equal((await readdir(content)).filter(n => n.endsWith('.md')).length, 24);
  assert.equal((await readdir(images)).filter(n => /\.(webp|jpg|png)$/.test(n)).length, 24);
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
