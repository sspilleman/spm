import { defineConfig } from 'vitest/config';

// Tests cover the pure parsers and helpers, so they run without the SvelteKit, Tailwind and
// devtools plugins from vite.config.ts. Vite resolves the #lib/* subpath import from
// package.json on its own.
export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
		environment: 'node'
	}
});
