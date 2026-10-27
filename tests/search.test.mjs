import test from 'node:test';
import assert from 'node:assert/strict';
import { findSearchResults, normalizeSearch } from '../src/lib/search.js';

const entries = [
  {title: 'Halaman Nol', kind: 'Poem', href: '/puisi/halaman-nol/'},
  {title: 'Mungkin Tuhan Lupa Memberimu Ekor', kind: 'Fragment', href: '/fragments/mungkin-tuhan-lupa-memberimu-ekor/'},
  {title: 'Refraction', kind: 'Series', href: '/series/refraction/'},
  {title: 'The Longest Time', kind: 'Poem', href: '/puisi/the-longest-time/'},
  {title: 'co-op', kind: 'Poem', href: '/puisi/co-op/'},
];

test('search finds titles across all three content types without changing destinations', () => {
  for (const [query, expected] of [['NOL', entries[0]], ['tuhan ekor', entries[1]], ['refrac', entries[2]]]) {
    assert.deepEqual(findSearchResults(entries, query), [expected]);
  }
});

test('search normalizes punctuation, whitespace and diacritics, and requires all query words', () => {
  assert.equal(normalizeSearch('  MÉMOIRE—d’été  '), 'memoire d ete');
  assert.deepEqual(findSearchResults(entries, 'co op'), [entries[4]]);
  assert.deepEqual(findSearchResults(entries, 'time longest'), [entries[3]]);
  assert.deepEqual(findSearchResults(entries, 'tuhan nol'), []);
  assert.deepEqual(findSearchResults(entries, '   '), []);
  assert.deepEqual(findSearchResults(entries, '?!'), []);
});

test('exact titles and title prefixes rank before matches inside another title', () => {
  const matches = [
    {title: 'A Long Time', kind: 'Poem', href: '/a/'},
    {title: 'Time After Time', kind: 'Poem', href: '/b/'},
    {title: 'Time', kind: 'Fragment', href: '/c/'},
  ];
  assert.deepEqual(findSearchResults(matches, 'time').map(entry => entry.href), ['/c/', '/b/', '/a/']);
});
