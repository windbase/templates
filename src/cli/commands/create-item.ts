import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import inquirer from 'inquirer';
import type {
	Block,
	BlockCategory,
	Template,
	TemplateCategory
} from '@/schemas';
import { blockCategories, templateCategories } from '@/schemas/categories';

type ItemType = 'block' | 'template';

interface CreateItemOptions {
	name?: string;
	category?: string;
	type?: ItemType;
}

export async function createItem(options: CreateItemOptions = {}) {
	console.log('🎨 Welcome to Windbase Templates Creator!\n');

	// Interactive prompts
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'type',
			message: 'What would you like to create?',
			choices: [
				{ name: '🧩 Block (Reusable component)', value: 'block' },
				{ name: '📄 Template (Complete page)', value: 'template' }
			],
			when: !options.type
		},
		{
			type: 'input',
			name: 'name',
			message: 'Enter the name:',
			when: !options.name,
			validate: (input: string) => {
				if (!input.trim()) {
					return 'Name is required!';
				}
				return true;
			}
		},
		{
			type: 'list',
			name: 'category',
			message: 'Select a category:',
			choices: (answers: Record<string, string>) => {
				const type = options.type || answers.type;
				const categories =
					type === 'block' ? blockCategories : templateCategories;
				return categories.map((cat) => ({
					name: cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
					value: cat
				}));
			},
			when: !options.category
		}
	]);

	// Merge options with answers
	const finalOptions = {
		type: options.type || answers.type,
		name: options.name || answers.name,
		category: options.category || answers.category
	};

	await createItemWithOptions(finalOptions);
}

async function createItemWithOptions(options: Required<CreateItemOptions>) {
	const { type, name, category } = options;

	// Get type-specific configuration
	const config = getTypeConfig(type);

	// Validate category
	if (!config.categories.includes(category)) {
		console.error(`❌ Invalid category: ${category}`);
		console.error(`Valid categories: ${config.categories.join(', ')}`);
		process.exit(1);
	}

	// Generate ID from name
	const id = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, ''); // Remove leading/trailing dashes

	// Create directory structure
	const itemDir = join('src', config.dirName, category, id);
	if (!existsSync(itemDir)) {
		mkdirSync(itemDir, { recursive: true });
	}

	// Check if item already exists
	const itemFile = join(itemDir, `${id}.json`);
	if (existsSync(itemFile)) {
		const overwrite = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'overwrite',
				message: `${type.charAt(0).toUpperCase() + type.slice(1)} "${id}" already exists. Overwrite?`,
				default: false
			}
		]);

		if (!overwrite.overwrite) {
			console.log('❌ Operation cancelled');
			return;
		}
	}

	// Create item JSON file
	const item: Block | Template = {
		id,
		name,
		description: `${name} ${type}`,
		category: category as BlockCategory | TemplateCategory,
		tags: ['new'],
		metadata: {
			author: 'Windbase Team',
			created: new Date().toISOString(),
			updated: new Date().toISOString(),
			version: '1.0.0'
		}
	};

	// Create HTML file
	const htmlContent = config.htmlTemplate(name, id);

	const htmlFile = join(itemDir, `${id}.html`);

	writeFileSync(itemFile, JSON.stringify(item, null, 2));
	writeFileSync(htmlFile, htmlContent);

	console.log(
		`\n✅ ${type.charAt(0).toUpperCase() + type.slice(1)} created successfully:`
	);
	console.log(`   📁 Directory: ${itemDir}`);
	console.log(`   📄 JSON: ${itemFile}`);
	console.log(`   📄 HTML: ${htmlFile}`);
	console.log(`   💡 Run 'bun run dev preview' to generate preview.png`);

	// Ask if user wants to generate preview now
	const generatePreview = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'preview',
			message: 'Generate preview image now?',
			default: true
		}
	]);

	if (generatePreview.preview) {
		console.log('\n📸 Generating preview...');
		// Import and run preview command
		const { previewCommand } = await import('./preview');
		await previewCommand({ [type]: id });
	}
}

function getTypeConfig(type: ItemType) {
	switch (type) {
		case 'block':
			return {
				dirName: 'blocks' as const,
				categories: blockCategories as readonly string[],
				defaultCategory: 'content' as const,
				htmlTemplate: (name: string, id: string) =>
					`<!-- ${name} HTML -->\n<div class="${id} p-8 bg-white rounded-lg shadow-md">\n  <h2 class="text-2xl font-bold text-gray-800 mb-4">${name}</h2>\n  <p class="text-gray-600">Edit this HTML file to customize your block.</p>\n</div>`
			};
		case 'template':
			return {
				dirName: 'templates' as const,
				categories: templateCategories as readonly string[],
				defaultCategory: 'other' as const,
				htmlTemplate: (name: string) =>
					`<!-- ${name} HTML -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${name}</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-gray-50 min-h-screen">\n  <div class="container mx-auto px-4 py-8">\n    <h1 class="text-4xl font-bold text-gray-900 mb-6">${name}</h1>\n    <p class="text-xl text-gray-600">Edit this HTML file to customize your template.</p>\n  </div>\n</body>\n</html>`
			};
		default:
			throw new Error(`Unknown type: ${type}`);
	}
}
