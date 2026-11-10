import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
	{ ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/'] },
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		// The app runs in the browser only. Keep runtime-specific globals and
		// import specifiers out of src/, so the code stays independent of the
		// runtime that builds it (see MIGRATION_AUDIT.md).
		files: ['src/**'],
		rules: {
			'no-restricted-globals': [
				'error',
				...['Deno', 'Bun', 'process', 'Buffer'].map((name) => ({
					name,
					message: 'src/ is browser code: use web-standard APIs instead.'
				}))
			],
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^(jsr|npm|node|https?):',
							message: 'Import npm packages by their bare name; src/ is browser code.'
						}
					]
				}
			]
		}
	}
);
