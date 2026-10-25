import { getCollection } from 'astro:content';
import { getPoems } from './poems';
import { resolveSeriesPoems } from './series-sequence.js';

export async function getSeries() {
  const [entries, published, allPoems] = await Promise.all([
    getCollection('series', ({ data }) => import.meta.env.DEV || !data.draft),
    getPoems(),
    getCollection('puisi'),
  ]);
  const known = new Set(allPoems.map(poem => poem.id));
  return entries.sort((a, b) => a.data.order - b.data.order).map(entry => {
    for (const reference of entry.data.poems) {
      if (!known.has(reference.id)) throw new Error(`Series ${entry.id}: unknown poem ${reference.id}`);
    }
    return { ...entry, poems: resolveSeriesPoems(entry.data.poems, published) };
  }).filter(entry => entry.poems.length > 0);
}

export type PoetrySeries = Awaited<ReturnType<typeof getSeries>>[number];
