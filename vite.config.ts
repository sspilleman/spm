import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  server: { port: 4000, host: "0.0.0.0" },
  preview: { port: 4000, host: "0.0.0.0" },
});
