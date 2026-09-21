import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
	// Enables TypeScript / PostCSS / etc. inside <script> and <style> blocks.
	preprocess: vitePreprocess(),
};
