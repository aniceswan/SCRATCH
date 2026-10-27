import type { APIRoute } from 'astro';
import { getPoems } from '../lib/poems';
import { getFragments } from '../lib/fragments';
import { getSeries } from '../lib/series';
import type { SearchEntry } from '../lib/search.js';

export const GET: APIRoute = async () => {
  const [poems, fragments, series] = await Promise.all([getPoems(), getFragments(), getSeries()]);
  const entries: SearchEntry[] = [
    ...poems.map(poem => ({title: poem.data.title, kind: 'Poem' as const, href: `/puisi/${poem.id}/`})),
    ...fragments.map(fragment => ({title: fragment.data.title, kind: 'Fragment' as const, href: `/fragments/${fragment.id}/`})),
    ...series.map(entry => ({title: entry.data.title, kind: 'Series' as const, href: `/series/${entry.id}/`})),
  ];
  return new Response(JSON.stringify(entries), {headers: {'Content-Type': 'application/json; charset=utf-8'}});
};
