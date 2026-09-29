import { globSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// Service claims only admin data may make. Owner-published copy (FAQ answers)
// is excluded and listed for owner confirmation instead; see
// docs/content/package-landing-drafts.md.
const CLAIM =
  /\bprivate\b|\bfree\b|complimentary|instant confirmation|free cancellation/i

const files = globSync(
  [
    "config/site.ts",
    "app/layout.tsx",
    "app/(main)/**/{page,layout}.tsx",
    "components/home/**/*.tsx",
    "components/packages/**/*.tsx",
    "components/common/**/*.tsx",
    "components/layout/**/*.tsx",
  ],
  { exclude: (path) => /privacy|\.test\.|faq-data/.test(String(path)) }
)

describe("no service claims in copy or metadata we write", () => {
  it("scans a non-trivial set of files", () => {
    expect(files.length).toBeGreaterThan(15)
  })

  it.each(files)("%s", (file) => {
    const offending = readFileSync(file, "utf8")
      .split("\n")
      .map((line, index) => ({ line: index + 1, text: line.trim() }))
      .filter(({ text }) => CLAIM.test(text))
    expect(offending).toEqual([])
  })
})
