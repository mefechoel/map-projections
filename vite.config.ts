import { defineConfig } from "vite";

const production = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
	css: {
		modules: {
			generateScopedName: production
				? "s[hash:base64:5]"
				: "[name]__[local]__[hash:base64:5]",
		},
	},
	build: {
		target: "modules",
		assetsInlineLimit: 0,
	},
});
