import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    venue: z.string().default('Shared with RSVP'),
    rsvp: z.union([z.string().url(), z.literal('')]).optional(),
    doors: z.string().optional(),
    seminar: z.string().optional(),
    depart: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { events };
