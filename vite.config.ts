import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

const target = ['chrome122', 'edge122', 'safari17', 'firefox124', 'opera105'];

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// The app is client-only (ssr = false), so it builds to a static SPA.
			// Serve build/ and fall back to 200.html for unknown paths.
			adapter: adapter({ fallback: '200.html' })
		}),
		devtoolsJson()
	],
	server: { port: 4000, host: '0.0.0.0' },
	preview: { port: 4000, host: '0.0.0.0' },
	build: { target }
});
