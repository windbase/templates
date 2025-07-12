import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { blockSchema, templateSchema } from '../../schemas';

export function validateCommand() {
	console.log('🔍 Validating blocks and templates...');

	let totalFiles = 0;
	let validFiles = 0;
	const errors: string[] = [];

	// Validate blocks
	const blocksDir = join('src', 'blocks');
	if (statSync(blocksDir).isDirectory()) {
		const blockCategories = readdirSync(blocksDir);

		for (const category of blockCategories) {
			const categoryPath = join(blocksDir, category);
			if (statSync(categoryPath).isDirectory()) {
				const blockDirs = readdirSync(categoryPath);

				for (const blockDir of blockDirs) {
					const blockPath = join(categoryPath, blockDir);
					if (statSync(blockPath).isDirectory()) {
						const jsonFile = join(blockPath, `${blockDir}.json`);
						try {
							const content = readFileSync(jsonFile, 'utf-8');
							const blockData = JSON.parse(content);

							const result = blockSchema.safeParse(blockData);
							if (result.success) {
								validFiles++;
								console.log(`✅ Block: ${blockData.id}`);
							} else {
								errors.push(
									`❌ Block ${blockData.id || 'unknown'}: ${result.error.message}`
								);
							}
							totalFiles++;
						} catch (error) {
							console.error(error);

							errors.push(
								`❌ Block ${blockDir}: Unable to read or parse JSON file`
							);
							totalFiles++;
						}
					}
				}
			}
		}
	}

	// Validate templates
	const templatesDir = join('src', 'templates');
	if (statSync(templatesDir).isDirectory()) {
		const templateCategories = readdirSync(templatesDir);

		for (const category of templateCategories) {
			const categoryPath = join(templatesDir, category);
			if (statSync(categoryPath).isDirectory()) {
				const templateDirs = readdirSync(categoryPath);

				for (const templateDir of templateDirs) {
					const templatePath = join(categoryPath, templateDir);
					if (statSync(templatePath).isDirectory()) {
						const jsonFile = join(templatePath, `${templateDir}.json`);
						try {
							const content = readFileSync(jsonFile, 'utf-8');
							const templateData = JSON.parse(content);

							const result = templateSchema.safeParse(templateData);
							if (result.success) {
								validFiles++;
								console.log(`✅ Template: ${templateData.id}`);
							} else {
								errors.push(
									`❌ Template ${templateData.id || 'unknown'}: ${result.error.message}`
								);
							}
							totalFiles++;
						} catch (error) {
							console.error(error);

							errors.push(
								`❌ Template ${templateDir}: Unable to read or parse JSON file`
							);
							totalFiles++;
						}
					}
				}
			}
		}
	}

	// Report results
	console.log('\n📊 Validation Results:');
	console.log(`Total files: ${totalFiles}`);
	console.log(`Valid files: ${validFiles}`);
	console.log(`Invalid files: ${totalFiles - validFiles}`);

	if (errors.length > 0) {
		console.log('\n🚨 Validation Errors:');
		errors.forEach((error) => console.log(error));
		process.exit(1);
	} else {
		console.log('\n🎉 All files are valid!');
	}
}
