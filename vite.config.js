import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// The `base` MUST match the GitHub Pages repository name so that asset URLs
// resolve correctly when deployed to https://<user>.github.io/rotation-systems/.
export default defineConfig({
	plugins: [svelte()],
	base: "/rotation-systems/",
	build: {
		// Raised from 500 kB, deliberately. three.js alone is ~600 kB minified
		// (~160 kB gzipped) and the tool cannot draw anything without it, so
		// splitting it out would add a request and still leave one chunk over
		// the default. Measured 2026-09-21: 740 kB total, 201 kB gzipped.
		chunkSizeWarningLimit: 900,
	},
});
