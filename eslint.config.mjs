import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
	...nextVitals,
	...nextTypeScript,
	{
		rules: {
			"react-hooks/error-boundaries": "warn",
			"react-hooks/immutability": "warn",
			"react-hooks/set-state-in-effect": "warn",
		},
	},
	globalIgnores([
		".next/**",
		"coverage/**",
		"node_modules/**",
		"out/**",
		"sanity.types.ts",
	]),
]);
