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

## API Structure

The build process creates a comprehensive API structure:

```
dist/api/
├── blocks.json              # All blocks collection
├── templates.json           # All templates collection
├── blocks/
│   ├── sample-hero.json     # Individual block schema
│   └── sample-hero.html     # Individual block HTML
└── templates/
    ├── landing-page.json    # Individual template schema
    └── landing-page.html    # Individual template HTML
```

## HTML Preview & Editing

The `index.html` file provides a user-friendly interface for previewing HTML files:

### Features:
- **File Upload** - Load HTML files directly
- **Drag & Drop** - Drag HTML files into the preview area
- **Sample Content** - Preview sample hero and template content
- **Real-time Preview** - See your HTML content rendered

### Usage:
1. Open `index.html` in your browser (or run `bun run dev preview --open`)
2. Load HTML files from your blocks/templates
3. Edit HTML files in your preferred editor
4. Refresh the preview to see changes

## Repository Structure

```
windbase-templates/
├── src/
│   ├── blocks/              # Blocks with .json and .html files
│   │   └── hero/
│   │       └── sample-hero/
│   │           ├── sample-hero.json
│   │           └── sample-hero.html
│   ├── templates/           # Templates with .json and .html files
│   │   └── landing-page/
│   │       └── sample-landing/
│   │           ├── sample-landing.json
│   │           └── sample-landing.html
│   ├── schemas/             # Zod schema definitions
│   └── cli/                 # CLI tool implementation
├── dist/                    # Built distribution files
│   └── api/                 # API structure
├── .github/workflows/       # CI/CD pipeline
├── docs/                    # Generated for GitHub Pages
└── index.html               # HTML preview tool
```

## Block Schema

Each block JSON file contains the following structure (without HTML):

```json
{
  "id": "hero-simple-001",
  "name": "Simple Hero Section",
  "description": "Clean hero section with title, subtitle, and CTA",
  "category": "hero",
  "tags": ["minimal", "responsive", "modern"],
  "preview": "https://cdn.windbase.com/previews/hero-simple-001.jpg",
  "css": "/* CSS styles */",
  "metadata": {
    "author": "Windbase Team",
    "created": "2024-01-01T00:00:00.000Z",
    "updated": "2024-01-15T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## Template Schema

Templates follow a similar structure (without HTML):

```json
{
  "id": "landing-startup-001",
  "name": "Startup Landing Page",
  "description": "Complete landing page for startup businesses",
  "category": "landing-page",
  "tags": ["startup", "modern", "conversion"],
  "preview": "https://cdn.windbase.com/previews/landing-startup-001.jpg",
  "css": "/* CSS styles */",
  "metadata": {
    "author": "Windbase Team",
    "created": "2024-01-01T00:00:00.000Z",
    "updated": "2024-01-15T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## API Endpoints

When deployed, the repository provides the following API endpoints:

### Collections:
- `GET /api/blocks.json` - All blocks metadata
- `GET /api/templates.json` - All templates metadata  
- `GET /api/index.json` - API metadata and stats

### Individual Items:
- `GET /api/blocks/{id}.json` - Individual block schema
- `GET /api/blocks/{id}.html` - Individual block HTML
- `GET /api/templates/{id}.json` - Individual template schema
- `GET /api/templates/{id}.html` - Individual template HTML

### Usage in Applications:

```javascript
// Fetch block metadata
const blockMeta = await fetch('/api/blocks/hero-simple-001.json').then(r => r.json());

// Fetch block HTML content
const blockHtml = await fetch('/api/blocks/hero-simple-001.html').then(r => r.text());

// Use both together
const component = {
  ...blockMeta,
  html: blockHtml
};
```

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
