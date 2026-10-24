import test from 'node:test';
import assert from 'node:assert/strict';
const parser = await import('../scripts/import-poems.mjs');
const source = `COLLECTION\n2 sajak\n\nI. PERTAMA\n────────────\n\n01 / AWAL\n\nSatu baris.\nDua baris.\n\nBait kedua.\n\nII. KEDUA\n────────────\n\n02 / LAST LIGHT\n\nOne line,\none silence.\n\nSELESAI\n\nCATATAN REDAKSI (bukan bagian sajak)\nNot a poem.\n`;

test('manuscript import preserves stanzas and excludes section/editorial notes', () => {
  assert.equal(typeof parser.parseManuscript, 'function', 'manuscript parser is implemented');
  const poems = parser.parseManuscript(source);
  assert.equal(poems.length, 2);
  assert.deepEqual(poems.map(p => [p.order, p.title, p.slug]), [[1, 'AWAL', 'awal'], [2, 'LAST LIGHT', 'last-light']]);
  assert.equal(poems[0].body, 'Satu baris.\nDua baris.\n\nBait kedua.');
  assert.equal(poems[1].body, 'One line,\none silence.');
});

test('manuscript import rejects missing or duplicate poem numbers', () => {
  assert.equal(typeof parser.parseManuscript, 'function');
  assert.throws(() => parser.parseManuscript(source.replace('02 /', '03 /')), /number|nomor/i);
  assert.throws(() => parser.parseManuscript(source.replace('02 /', '01 /')), /number|nomor/i);
});
