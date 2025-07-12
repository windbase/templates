import { z } from 'zod';
import { blockCategories } from './categories';

export const blockMetadataSchema = z.object({
	author: z.string(),
	created: z.string().datetime(),
	updated: z.string().datetime(),
	version: z.string()
});

export const blockSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	category: z.enum(blockCategories),
	tags: z.array(z.string()),
	metadata: blockMetadataSchema
});

export type Block = z.infer<typeof blockSchema>;
export type BlockMetadata = z.infer<typeof blockMetadataSchema>;
