import { exec } from 'node:child_process';
import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'playwright';
import { chromium } from 'playwright';

interface PreviewOptions {
	block?: string;
	template?: string;
	open?: boolean;
}

export async function previewCommand(options: PreviewOptions) {
	console.log('📸 Generating preview images...');

	// If --open flag is passed, open index.html in browser
	if (options.open) {
		const indexPath = join(process.cwd(), 'index.html');
		if (existsSync(indexPath)) {
			console.log('🌐 Opening index.html in browser...');

			// Determine the command based on the platform
			const command =
				process.platform === 'darwin'
					? 'open'
					: process.platform === 'win32'
						? 'start'
						: 'xdg-open';

			exec(`${command} ${indexPath}`, (error) => {
				if (error) {
					console.error('❌ Failed to open browser:', error.message);
					console.log('💡 Please manually open index.html in your browser');
				} else {
					console.log('✅ Browser opened successfully');
				}
			});
		} else {
			console.error('❌ index.html not found in current directory');
		}
		return;
	}

	// Launch Playwright browser
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();

	// Set viewport size for consistent screenshots
	await page.setViewportSize({ width: 1200, height: 800 });

	try {
		if (options.block) {
			await generateBlockPreview(page, options.block);
		} else if (options.template) {
			await generateTemplatePreview(page, options.template);
		} else {
			// Generate previews for all blocks and templates
			await generateAllPreviews(page);
		}
	} catch (error) {
		console.error('❌ Error generating previews:', error);
	} finally {
		await browser.close();
	}

	console.log('✅ Preview generation complete');
}

async function generateBlockPreview(page: Page, blockId: string) {
	console.log(`🔍 Generating preview for block: ${blockId}`);

	// Find the block in the filesystem
	const blocksDir = join('src', 'blocks');
	const blockPath = findItemPath(blocksDir, blockId);

	if (!blockPath) {
		console.error(`❌ Block ${blockId} not found`);
		return;
	}

	await generatePreviewForItem(page, blockPath, blockId);
}

async function generateTemplatePreview(page: Page, templateId: string) {
	console.log(`🔍 Generating preview for template: ${templateId}`);

	// Find the template in the filesystem
	const templatesDir = join('src', 'templates');
	const templatePath = findItemPath(templatesDir, templateId);

	if (!templatePath) {
		console.error(`❌ Template ${templateId} not found`);
		return;
	}

	await generatePreviewForItem(page, templatePath, templateId);
}

async function generateAllPreviews(page: Page) {
	console.log('🔍 Generating previews for all blocks and templates...');

	// Generate previews for all blocks
	const blocksDir = join('src', 'blocks');
	if (existsSync(blocksDir)) {
		const blockCategories = readdirSync(blocksDir);
		for (const category of blockCategories) {
			const categoryPath = join(blocksDir, category);
			if (statSync(categoryPath).isDirectory()) {
				const blockDirs = readdirSync(categoryPath);
				for (const blockDir of blockDirs) {
					const blockPath = join(categoryPath, blockDir);
					if (statSync(blockPath).isDirectory()) {
						await generatePreviewForItem(page, blockPath, blockDir);
					}
				}
			}
		}
	}

	// Generate previews for all templates
	const templatesDir = join('src', 'templates');
	if (existsSync(templatesDir)) {
		const templateCategories = readdirSync(templatesDir);
		for (const category of templateCategories) {
			const categoryPath = join(templatesDir, category);
			if (statSync(categoryPath).isDirectory()) {
				const templateDirs = readdirSync(categoryPath);
				for (const templateDir of templateDirs) {
					const templatePath = join(categoryPath, templateDir);
					if (statSync(templatePath).isDirectory()) {
						await generatePreviewForItem(page, templatePath, templateDir);
					}
				}
			}
		}
	}
}

async function generatePreviewForItem(
	page: Page,
	itemPath: string,
	itemId: string
) {
	const htmlFile = join(itemPath, `${itemId}.html`);
	const jsonFile = join(itemPath, `${itemId}.json`);
	const previewFile = join(itemPath, 'preview.png');

	if (!existsSync(htmlFile)) {
		console.error(`❌ HTML file not found: ${htmlFile}`);
		return;
	}

	try {
		// Read the HTML content
		const htmlContent = readFileSync(htmlFile, 'utf-8');

		// Create a complete HTML document for rendering
		const fullHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

		// Set the HTML content
		await page.setContent(fullHtmlContent);

		// Wait for any dynamic content to load
		await page.waitForTimeout(1000);

		// Take screenshot of just the body element
		await page.locator('body').screenshot({
			path: previewFile,
			type: 'png'
		});

		console.log(`✅ Preview generated: ${previewFile}`);

		// Update the JSON file to reference the local preview
		if (existsSync(jsonFile)) {
			const jsonContent = JSON.parse(readFileSync(jsonFile, 'utf-8'));
			jsonContent.preview = `./preview.png`;
			writeFileSync(jsonFile, JSON.stringify(jsonContent, null, 2));
		}
	} catch (error) {
		console.error(`❌ Error generating preview for ${itemId}:`, error);
	}
}

function findItemPath(baseDir: string, itemId: string): string | null {
	if (!existsSync(baseDir)) return null;

	const categories = readdirSync(baseDir);
	for (const category of categories) {
		const categoryPath = join(baseDir, category);
		if (statSync(categoryPath).isDirectory()) {
			const itemPath = join(categoryPath, itemId);
			if (existsSync(itemPath) && statSync(itemPath).isDirectory()) {
				return itemPath;
			}
		}
	}
	return null;
}
