import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const target = ["chrome122", "edge122", "safari17", "firefox124", "opera105"];

export default defineConfig({
	plugins: [sveltekit()],
	server: { port: 4000, host: "0.0.0.0" },
	preview: { port: 4000, host: "0.0.0.0" },
	build: { target },
});
