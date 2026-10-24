import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
      draft: z.boolean().default(false),
    }),
});

export const collections = { puisi };
