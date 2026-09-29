import { globSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// Keyboard users need to see where focus is (WCAG 2.4.7). `focus:outline-none`
// hides the outline for every focus, keyboard included, so it must come with a
// focus-visible replacement on the same element. Inline `outline: none` has no
// such escape hatch at all.
const REMOVES_FOCUS = /\bfocus:outline-none\b/
const HAS_REPLACEMENT = /\bfocus-visible:/
const INLINE_NONE = /outline:\s*["']none["']/

const files = globSync(["app/**/*.tsx", "components/**/*.tsx"], {
  exclude: (path) => /\.test\./.test(String(path)),
})

describe("every focusable element keeps a visible focus indicator", () => {
  it("scans a non-trivial set of files", () => {
    expect(files.length).toBeGreaterThan(40)
  })

  it.each(files)("%s", (file) => {
    const offending = readFileSync(file, "utf8")
      .split("\n")
      .map((line, index) => ({ line: index + 1, text: line.trim() }))
      .filter(
        ({ text }) =>
          (REMOVES_FOCUS.test(text) && !HAS_REPLACEMENT.test(text)) ||
          INLINE_NONE.test(text)
      )
    expect(offending).toEqual([])
  })
})
