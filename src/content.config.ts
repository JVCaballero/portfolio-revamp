import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const publicationState = z.enum(['draft', 'published']);
const confidentiality = z.object({
  level: z.enum(['public', 'anonymized', 'confidential']),
  reviewed: z.boolean().default(false),
});
const metric = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  verification: z.enum(['verified', 'qualitative', 'pending']),
});

const professionalEntry = z
  .object({
    title: z.string().min(1),
    status: publicationState.default('draft'),
    publishedAt: z.coerce.date().optional(),
    confidentiality,
    metrics: z.array(metric).default([]),
    featured: z.boolean().default(false),
  })
  .refine(
    (entry) => entry.status === 'draft' || entry.publishedAt !== undefined,
    {
      error: 'Published entries require publishedAt.',
    },
  );

const columnEntry = z
  .object({
    title: z.string().min(1),
    status: publicationState.default('draft'),
    publishedAt: z.coerce.date().optional(),
    description: z.string().min(1),
  })
  .refine(
    (entry) => entry.status === 'draft' || entry.publishedAt !== undefined,
    {
      error: 'Published columns require publishedAt.',
    },
  );

const features = defineCollection({
  loader: glob({ pattern: '**/*.(md|mdx)', base: './src/content/features' }),
  schema: professionalEntry,
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.(md|mdx)', base: './src/content/reviews' }),
  schema: professionalEntry,
});

const columns = defineCollection({
  loader: glob({ pattern: '**/*.(md|mdx)', base: './src/content/columns' }),
  schema: columnEntry,
});

const bSides = defineCollection({
  loader: glob({ pattern: '**/*.(md|mdx)', base: './src/content/b-sides' }),
  schema: professionalEntry,
});

export const collections = { features, reviews, columns, 'b-sides': bSides };
