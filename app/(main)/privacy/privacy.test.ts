import { globSync, readFileSync } from "node:fs"
import { expect, it } from "vitest"

const PRIVACY = "app/(main)/privacy/page.tsx"
const read = (file: string) => readFileSync(file, "utf8")

const codeFiles = globSync(
  ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.ts", "utils/**/*.ts", "hooks/**/*.ts"],
  { exclude: (path) => /\.test\./.test(String(path)) || String(path) === PRIVACY }
)

// The policy must describe what the code does: the favourites feature (the
// only browser storage) was removed, and the policy still described it.
it("mentions browser storage exactly when the site code uses it", () => {
  const usesStorage = codeFiles.some((file) =>
    /\b(localStorage|sessionStorage|indexedDB)\b/.test(read(file))
  )
  const describesStorage = /local storage|in your browser|favou?rites/i.test(
    read(PRIVACY)
  )
  expect({ describesStorage }).toEqual({ describesStorage: usesStorage })
})

it("scans a non-trivial set of files", () => {
  expect(codeFiles.length).toBeGreaterThan(60)
})
