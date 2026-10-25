/** @template {{id: string}} T
 * @param {{id: string}[]} references
 * @param {T[]} publishedPoems
 * @returns {T[]}
 */
export function resolveSeriesPoems(references, publishedPoems) {
  const available = new Map(publishedPoems.map(poem => [poem.id, poem]));
  return references.flatMap(reference => {
    const poem = available.get(reference.id);
    return poem ? [poem] : [];
  });
}

/** @template {{id: string, data: {title: string}}} T
 * @param {T[]} poems
 * @param {number} index
 * @param {string} prefix
 */
export function readingProps(poems, index, prefix = '/puisi/') {
  if (!Number.isInteger(index) || index < 0 || index >= poems.length) {
    throw new RangeError('Reader position must belong to its poem sequence');
  }
  const link = (/** @type {T} */ poem) => ({
    title: poem.data.title,
    url: `${prefix}${encodeURIComponent(poem.id)}/`,
  });
  return {
    poem: poems[index],
    number: index + 1,
    total: poems.length,
    previous: link(poems[(index - 1 + poems.length) % poems.length]),
    next: link(poems[(index + 1) % poems.length]),
  };
}
