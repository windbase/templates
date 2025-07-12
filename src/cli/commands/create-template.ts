import { createItem } from './create-item';

interface CreateTemplateOptions {
	name?: string;
	category?: string;
}

export async function createTemplate(options: CreateTemplateOptions) {
	await createItem({
		...options,
		type: 'template'
	});
}
