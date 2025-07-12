import { z } from 'zod';

export const blockCategorySchema = z.enum([
	'call-to-action',
	'hero',
	'features',
	'testimonials',
	'pricing',
	'footer',
	'header',
	'content',
	'forms',
	'gallery'
]);

export const templateCategorySchema = z.enum([
	'landing-page',
	'blog',
	'portfolio',
	'product',
	'service',
	'other'
]);

export type BlockCategory = z.infer<typeof blockCategorySchema>;
export type TemplateCategory = z.infer<typeof templateCategorySchema>;

export const blockCategories = blockCategorySchema.options;
export const templateCategories = templateCategorySchema.options;
