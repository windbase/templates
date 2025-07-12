#!/usr/bin/env bun

import { Command } from 'commander';
import { buildCommand } from '../commands/build';
import { createBlock } from '../commands/create-block';
import { createItem } from '../commands/create-item';
import { createTemplate } from '../commands/create-template';
import { previewCommand } from '../commands/preview';
import { validateCommand } from '../commands/validate';

const program = new Command();

program
	.name('windbase')
	.description('CLI tool for managing Windbase templates and blocks')
	.version('1.0.0');

// Main create command (interactive)
program
	.command('create')
	.description('Create a new block or template (interactive)')
	.option('-n, --name <name>', 'Name of the item')
	.option('-c, --category <category>', 'Category of the item')
	.action(async (options) => {
		await createItem(options);
	});

// Specific create commands for CI/automation
program
	.command('create-block')
	.description('Create a new block')
	.option('-n, --name <name>', 'Block name')
	.option('-c, --category <category>', 'Block category')
	.action(async (options) => {
		await createBlock(options);
	});

program
	.command('create-template')
	.description('Create a new template')
	.option('-n, --name <name>', 'Template name')
	.option('-c, --category <category>', 'Template category')
	.action(async (options) => {
		await createTemplate(options);
	});

program
	.command('preview')
	.description('Generate preview images for blocks and templates')
	.option('-b, --block <blockId>', 'Generate preview for specific block')
	.option(
		'-t, --template <templateId>',
		'Generate preview for specific template'
	)
	.option('-o, --open', 'Open index.html in browser')
	.action(async (options) => {
		await previewCommand(options);
	});

program
	.command('validate')
	.description('Validate all blocks and templates')
	.action(validateCommand);

program
	.command('build')
	.description('Build distribution files')
	.action(buildCommand);

program.parse();
