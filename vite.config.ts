import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import devtoolsJson from "vite-plugin-devtools-json";

const target = ["chrome122", "edge122", "safari17", "firefox124", "opera105"];

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	server: { port: 4000, host: "0.0.0.0" },
	preview: { port: 4000, host: "0.0.0.0" },
	build: { target },
});
