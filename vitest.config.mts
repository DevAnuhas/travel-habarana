import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = fileURLToPath(new URL(".", import.meta.url))

// Mirror Vercel's runtime (UTC). Date bugs that only appear in UTC stay
// invisible on a developer machine in Sri Lanka (+05:30) otherwise.
// Workers inherit this environment when Vitest spawns them.
process.env.TZ = "UTC"

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\/(.*)$/, replacement: `${root}$1` }],
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", ".pnpm-store/**"],
  },
})
