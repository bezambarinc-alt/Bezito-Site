import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    sku: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    category: z.enum([
      'rings',
      'engagement-rings',
      'wedding-bands',
      'earrings',
      'pendants',
      'necklaces',
      'bracelets',
    ]),
    collection: z.string().nullable().default(null),
    status: z.enum(['live', 'draft', 'archived']),
    refCode: z.string(),
    stone: z.object({
      shape: z.string(),
      carats: z.union([z.number(), z.string()]),
      color: z.string().optional(),
      clarity: z.string().optional(),
      origin: z.string().optional(),
    }),
    metal: z.string(),
    description: z.string(),
    heroVideo: z.string().url().nullable().default(null),
    heroImage: z.string().url().nullable().default(null),
    images: z.array(z.string().url()).default([]),
    inquirySubject: z.string(),
    prettyUrl: z.string(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updatedDate: z.date().optional(),
    category: z.string(),
    excerpt: z.string(),
    heroImage: z.string().url().optional(),
    heroImageAlt: z.string().optional(),
    author: z.string().default('Bez Ambar'),
    status: z.enum(['live', 'draft']),
    schema: z.object({
      type: z.string().optional(),
      faq: z.boolean().optional(),
    }).optional(),
  }),
});

export const collections = { products, blog };
