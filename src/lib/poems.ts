import { getCollection, type CollectionEntry } from 'astro:content';

export type Poem = CollectionEntry<'puisi'>;

/** Semua puisi, terbaru lebih dulu. Draft hanya muncul saat `astro dev`. */
export async function getPoems(): Promise<Poem[]> {
  const poems = await getCollection('puisi', ({ data }) => {
    return import.meta.env.DEV || !data.draft;
  });

  return poems.sort((a, b) => (b.data.date.valueOf() - a.data.date.valueOf()) || (a.data.order - b.data.order));
}

export function padIndex(index: number): string {
  return String(index).padStart(2, '0');
}

export function formatDate(date: Date, style: 'short' | 'long' = 'long'): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: style === 'short' ? 'short' : 'long',
    year: 'numeric',
  })
    .format(date)
    .replace('.', '')
    .toUpperCase();
}
