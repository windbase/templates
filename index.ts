// Windbase Templates Repository
// This package provides TypeScript schemas and CLI tools for managing Windbase templates

// Re-export commonly used types and schemas
export type {
	Block,
	BlockCategory,
	Template,
	TemplateCategory
} from './src/schemas';
export * from './src/schemas';

// Package information
export const VERSION = '1.0.0';
export const REPOSITORY_URL = 'https://github.com/windbase/templates';
export const API_BASE_URL = 'https://templates.windbase.com/api';

// Helper functions for API access
export const getBlocksUrl = () => `${API_BASE_URL}/blocks.json`;
export const getTemplatesUrl = () => `${API_BASE_URL}/templates.json`;
export const getManifestUrl = () => `${API_BASE_URL}/index.json`;
