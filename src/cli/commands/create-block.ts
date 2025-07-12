import { createItem } from './create-item';

interface CreateBlockOptions {
	name?: string;
	category?: string;
}

export async function createBlock(options: CreateBlockOptions) {
	await createItem({
		...options,
		type: 'block'
	});
}
