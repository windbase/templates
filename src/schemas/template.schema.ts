import { z } from 'zod';
import { templateCategories } from './categories';

export const templateMetadataSchema = z.object({
	author: z.string(),
	created: z.string().datetime(),
	updated: z.string().datetime(),
	version: z.string()
});

export const templateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	category: z.enum(templateCategories),
	tags: z.array(z.string()),
	metadata: templateMetadataSchema
});

export type Template = z.infer<typeof templateSchema>;
export type TemplateMetadata = z.infer<typeof templateMetadataSchema>;
