import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import type { Block, Template } from '@/schemas';
import { blockSchema, templateSchema } from '@/schemas';

export function buildCommand() {
	console.log('🏗️  Building distribution files...');

	const distDir = 'dist';
	const apiDir = join(distDir, 'api');
	const blocksApiDir = join(apiDir, 'blocks');
	const templatesApiDir = join(apiDir, 'templates');

	// Create directory structure
	[distDir, apiDir, blocksApiDir, templatesApiDir].forEach((dir) => {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	});

	const blocks: Block[] = [];
	const templates: Template[] = [];

	// Read blocks
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
						const jsonFile = join(blockPath, `${blockDir}.json`);
						const htmlFile = join(blockPath, `${blockDir}.html`);
						const previewFile = join(blockPath, 'preview.png');

						try {
							// Read and validate JSON
							const content = readFileSync(jsonFile, 'utf-8');
							const blockData = JSON.parse(content);

							const result = blockSchema.safeParse(blockData);
							if (result.success) {
								blocks.push(result.data);

								// Create category directory in API
								const categoryApiDir = join(blocksApiDir, category);
								if (!existsSync(categoryApiDir)) {
									mkdirSync(categoryApiDir, { recursive: true });
								}

								// Copy JSON file to API category directory
								const apiJsonFile = join(categoryApiDir, `${blockDir}.json`);
								copyFileSync(jsonFile, apiJsonFile);

								// Copy HTML file to API category directory if it exists
								if (existsSync(htmlFile)) {
									const apiHtmlFile = join(categoryApiDir, `${blockDir}.html`);
									copyFileSync(htmlFile, apiHtmlFile);
								}

								// Copy preview.png file to API category directory if it exists
								if (existsSync(previewFile)) {
									const apiPreviewFile = join(
										categoryApiDir,
										`${blockDir}-preview.png`
									);
									copyFileSync(previewFile, apiPreviewFile);
								}
							} else {
								console.error(
									`❌ Block ${blockData.id || 'unknown'}: ${result.error.message}`
								);
								throw new Error(result.error.message);
							}
						} catch (error) {
							console.error(error);

							console.error(
								`❌ Block ${blockDir}: Unable to read or parse JSON file`
							);
						}
					}
				}
			}
		}
	}

	// Read templates
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
						const jsonFile = join(templatePath, `${templateDir}.json`);
						const htmlFile = join(templatePath, `${templateDir}.html`);
						const previewFile = join(templatePath, 'preview.png');

						try {
							// Read and validate JSON
							const content = readFileSync(jsonFile, 'utf-8');
							const templateData = JSON.parse(content);

							const result = templateSchema.safeParse(templateData);
							if (result.success) {
								templates.push(result.data);

								// Create category directory in API
								const categoryApiDir = join(templatesApiDir, category);
								if (!existsSync(categoryApiDir)) {
									mkdirSync(categoryApiDir, { recursive: true });
								}

								// Copy JSON file to API category directory
								const apiJsonFile = join(categoryApiDir, `${templateDir}.json`);
								copyFileSync(jsonFile, apiJsonFile);

								// Copy HTML file to API category directory if it exists
								if (existsSync(htmlFile)) {
									const apiHtmlFile = join(
										categoryApiDir,
										`${templateDir}.html`
									);
									copyFileSync(htmlFile, apiHtmlFile);
								}

								// Copy preview.png file to API category directory if it exists
								if (existsSync(previewFile)) {
									const apiPreviewFile = join(
										categoryApiDir,
										`${templateDir}-preview.png`
									);
									copyFileSync(previewFile, apiPreviewFile);
								}

								console.log(`✅ Template: ${templateData.id}`);
							} else {
								console.error(
									`❌ Template ${templateData.id || 'unknown'}: ${result.error.message}`
								);
							}
						} catch (error) {
							console.error(error);

							console.error(
								`❌ Template ${templateDir}: Unable to read or parse JSON file`
							);
						}
					}
				}
			}
		}
	}

	// Write collection files ONLY to API directory
	writeFileSync(join(apiDir, 'blocks.json'), JSON.stringify(blocks, null, 2));
	writeFileSync(
		join(apiDir, 'templates.json'),
		JSON.stringify(templates, null, 2)
	);

	// Create index/manifest file ONLY in API directory
	const manifest = {
		blocks: blocks.length,
		templates: templates.length,
		lastUpdated: new Date().toISOString(),
		version: '1.0.0',
		apiStructure: {
			blocks: {
				collection: '/api/blocks.json',
				individual: '/api/blocks/{category}/{id}.json',
				html: '/api/blocks/{category}/{id}.html',
				preview: '/api/blocks/{category}/{id}-preview.png'
			},
			templates: {
				collection: '/api/templates.json',
				individual: '/api/templates/{category}/{id}.json',
				html: '/api/templates/{category}/{id}.html',
				preview: '/api/templates/{category}/{id}-preview.png'
			}
		}
	};

	writeFileSync(join(apiDir, 'index.json'), JSON.stringify(manifest, null, 2));

	// Create main index.html file at root
	const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Windbase Templates</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                <i class="fas fa-wind text-blue-600"></i>
                Windbase Templates
            </h1>
            <p class="text-xl text-gray-600">Dynamic template repository with CLI tooling</p>
        </header>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-2 gap-6 mb-12">
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Templates</h3>
                        <p class="text-3xl font-bold text-blue-600">${templates.length}</p>
                        <p class="text-sm text-gray-500">Complete page templates</p>
                    </div>
                    <div class="text-4xl text-blue-500">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">Blocks</h3>
                        <p class="text-3xl font-bold text-green-600">${blocks.length}</p>
                        <p class="text-sm text-gray-500">Reusable components</p>
                    </div>
                    <div class="text-4xl text-green-500">
                        <i class="fas fa-cubes"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- API Information -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-code text-purple-600"></i>
                API Endpoints
            </h2>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <h3 class="font-semibold text-gray-700 mb-2">Collections</h3>
                    <div class="space-y-2">
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-blue-600">GET /api/blocks.json</code>
                            <p class="text-xs text-gray-600 mt-1">All blocks metadata</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-blue-600">GET /api/templates.json</code>
                            <p class="text-xs text-gray-600 mt-1">All templates metadata</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-blue-600">GET /api/index.json</code>
                            <p class="text-xs text-gray-600 mt-1">API metadata and stats</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-700 mb-2">Individual Items</h3>
                    <div class="space-y-2">
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-green-600">GET /api/blocks/{category}/{id}.json</code>
                            <p class="text-xs text-gray-600 mt-1">Block schema</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-green-600">GET /api/blocks/{category}/{id}.html</code>
                            <p class="text-xs text-gray-600 mt-1">Block HTML content</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-green-600">GET /api/blocks/{category}/{id}-preview.png</code>
                            <p class="text-xs text-gray-600 mt-1">Block preview image</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-green-600">GET /api/templates/{category}/{id}.json</code>
                            <p class="text-xs text-gray-600 mt-1">Template schema</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-green-600">GET /api/templates/{category}/{id}.html</code>
                            <p class="text-xs text-gray-600 mt-1">Template HTML content</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded">
                            <code class="text-sm text-green-600">GET /api/templates/{category}/{id}-preview.png</code>
                            <p class="text-xs text-gray-600 mt-1">Template preview image</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Last Updated -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-clock text-orange-600"></i>
                Build Information
            </h2>
            <div class="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span class="font-medium text-gray-700">Last Updated:</span>
                    <p class="text-gray-600">${new Date().toLocaleString()}</p>
                </div>
                <div>
                    <span class="font-medium text-gray-700">Version:</span>
                    <p class="text-gray-600">1.0.0</p>
                </div>
                <div>
                    <span class="font-medium text-gray-700">Total Items:</span>
                    <p class="text-gray-600">${blocks.length + templates.length}</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center mt-12 text-gray-500">
            <p>Built with <i class="fas fa-heart text-red-500"></i> by Windbase Team</p>
            <p class="mt-2">
                <a href="https://github.com/windbase/templates" class="text-blue-600 hover:text-blue-800">
                    <i class="fab fa-github"></i> GitHub Repository
                </a>
            </p>
        </footer>
    </div>
</body>
</html>`;

	writeFileSync(join(distDir, 'index.html'), indexHtml);

	console.log('\n📦 Build Complete:');
	console.log(`   📄 ${blocks.length} blocks compiled`);
	console.log(`   📄 ${templates.length} templates compiled`);
	console.log(`   📁 Distribution files created in: ${distDir}`);
	console.log(`   🔗 API structure created in: ${apiDir}`);
	console.log(
		`   🌐 Main index.html created at: ${join(distDir, 'index.html')}`
	);
	console.log('\n🌐 API Endpoints:');
	console.log(`   📋 /api/blocks.json - All blocks`);
	console.log(`   📋 /api/templates.json - All templates`);
	console.log(
		`   📄 /api/blocks/{category}/{id}.json - Individual block schema`
	);
	console.log(`   📄 /api/blocks/{category}/{id}.html - Individual block HTML`);
	console.log(
		`   📄 /api/blocks/{category}/{id}-preview.png - Individual block preview`
	);
	console.log(
		`   📄 /api/templates/{category}/{id}.json - Individual template schema`
	);
	console.log(
		`   📄 /api/templates/{category}/{id}.html - Individual template HTML`
	);
	console.log(
		`   📄 /api/templates/{category}/{id}-preview.png - Individual template preview`
	);
}
