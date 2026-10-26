import { getCollection, type CollectionEntry } from 'astro:content';

export type Fragment = CollectionEntry<'fragments'>;

export async function getFragments(): Promise<Fragment[]> {
  const entries = await getCollection('fragments', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'id'));
}
