import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const youtubeSoundtrack = z.object({
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  title: z.string().min(1),
  artist: z.string().min(1),
  startSeconds: z.number().int().nonnegative().default(0),
});

const puisi = defineCollection({
  loader: glob({ base: './src/content/puisi', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      date: z.coerce.date(),
      order: z.number().int().nonnegative().default(0),
      lang: z.enum(['id', 'en']).default('id'),
      image: image(),
      imageAlt: z.string(),
      excerpt: z.string().max(260),
      youtube: youtubeSoundtrack.optional(),
      draft: z.boolean().default(false),
    }),
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1).max(100),
    order: z.number().int().nonnegative().default(0),
    cover: image(),
    coverAlt: z.string(),
    poems: z.array(reference('puisi')).min(1).refine(
      poems => new Set(poems.map(poem => poem.id)).size === poems.length,
      'A poem may only appear once within a series',
    ),
    draft: z.boolean().default(false),
  }),
});

const fragments = defineCollection({
  loader: glob({ base: './src/content/fragments', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1).max(180),
    order: z.number().int().nonnegative().default(0),
    lang: z.enum(['id', 'en']).default('id'),
    image: image(),
    imageAlt: z.string(),
    excerpt: z.string().max(260),
    youtube: youtubeSoundtrack.optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { puisi, series, fragments };
