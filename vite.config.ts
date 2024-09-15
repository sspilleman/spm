import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	server: { port: 4000, host: "0.0.0.0" },
	preview: { port: 4000, host: "0.0.0.0" },
});
