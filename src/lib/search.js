/** @typedef {{title: string, kind: 'Poem' | 'Fragment' | 'Series', href: string}} SearchEntry */

/** @param {string} text */
export function normalizeSearch(text) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('id')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

/**
 * Match every query word, keeping exact titles and title prefixes first.
 * @param {SearchEntry[]} entries
 * @param {string} query
 * @returns {SearchEntry[]}
 */
export function findSearchResults(entries, query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  const terms = normalized.split(' ');
  return entries.map(entry => {
    const title = normalizeSearch(entry.title);
    const matches = terms.every(term => title.includes(term));
    const score = title === normalized ? 0 : title.startsWith(normalized) ? 1
      : terms.every(term => title.split(' ').some(word => word.startsWith(term))) ? 2 : 3;
    return {entry, matches, score};
  }).filter(result => result.matches)
    .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title, 'id'))
    .map(result => result.entry);
}
