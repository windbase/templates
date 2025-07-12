<img width="1080" height="258" alt="Artboard" src="https://github.com/user-attachments/assets/026090a0-60bb-4189-9bd9-d17f4e1c05c3" />

## Overview

This repository provides a structured approach to managing HTML/CSS templates and blocks for the Windbase platform. It includes:

- **JSON Schema Validation** with Zod
- **CLI Tools** for creating and managing templates
- **Separate HTML Files** for better editing experience
- **Automated CI/CD** pipeline with GitHub Actions
- **GitHub Pages API** for dynamic template loading

## Installation

```bash
bun install
```

## CLI Usage

### Create a new block/template

```bash
bun windbase create
```

You will be prompted to enter the name and category of the block/template.

### Validate all templates and blocks

```bash
bun run validate
```

### Generate preview image

```bash
# For block
bun windbase preview -b <block-id>

# For template
bun windbase preview -t <template-id>
```

## File Structure

When you create a block or template, the CLI generates both JSON and HTML files:

```
src/blocks/hero/sample-hero/
├── sample-hero.json    # Schema and metadata
└── sample-hero.html    # HTML content
```

### Benefits of separate files:
- **Better editing experience** - Edit HTML in your favorite editor with syntax highlighting
- **Version control friendly** - Cleaner diffs for HTML changes
- **API flexibility** - Serve JSON schema and HTML content separately
- **No escaping needed** - Pure HTML without JSON string escaping

## Development Workflow

### 1. Create a new block:
```bash
bun windbase create
```

You will be prompted to enter the name and category of the block.

### 2. Edit the generated files:
- Edit `src/blocks/hero/hero-section/hero-section.json` for metadata
- Edit `src/blocks/hero/hero-section/hero-section.html` for HTML content

### 3. Generate preview image:

You can generate a preview image for your block or template by running the following command:

```bash
bun windbase preview -b <block-id>
```

### 4. Build and deploy:
```bash
bun run build
```

## Development Scripts

- `bun run format:write` - Format code with Biome
- `bun run build` - Build distribution files and API structure
- `bun run validate` - Validate all schemas

## Adding New Categories

1. Update the category enums in `src/schemas/categories.ts`
2. Run validation to ensure consistency
3. Update documentation as needed

## CI/CD Pipeline

The repository includes two GitHub Actions workflows:

- **CI (`ci.yml`)**: Validates schemas and builds on every push/PR
- **Deploy (`deploy.yml`)**: Deploys to GitHub Pages on main branch updates

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation and tests
5. Submit a pull request
