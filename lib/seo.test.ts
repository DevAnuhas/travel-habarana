import { describe, expect, it } from "vitest"

import { buildPackageTitle, truncateAtWord } from "./seo"

const long =
  "Embark on a private jeep safari through Hurulu Eco Park, where herds of wild elephants gather near the reservoir and our local guide explains their behaviour in detail."

describe("truncateAtWord", () => {
  it("returns short text unchanged", () => {
    expect(truncateAtWord("Private safari.", 160)).toBe("Private safari.")
  })

  it("collapses whitespace and newlines", () => {
    expect(truncateAtWord("Private\n  safari", 160)).toBe("Private safari")
  })

  it("cuts at a word boundary with an ellipsis within the limit", () => {
    const result = truncateAtWord(long, 120)
    expect(result.length).toBeLessThanOrEqual(120)
    expect(result.endsWith("…")).toBe(true)
    const kept = result.slice(0, -1)
    expect(long.startsWith(`${kept} `) || long.startsWith(`${kept},`)).toBe(
      true
    )
  })

  it("does not leave trailing punctuation before the ellipsis", () => {
    expect(truncateAtWord("Minneriya, Kaudulla, Hurulu, Habarana", 22)).toBe(
      "Minneriya, Kaudulla…"
    )
  })

  it("hard-cuts a single enormous word", () => {
    expect(truncateAtWord("a".repeat(300), 50)).toHaveLength(50)
  })

  it("defaults to the 160-character meta description limit", () => {
    expect(truncateAtWord(long.repeat(2)).length).toBeLessThanOrEqual(160)
  })
})

describe("buildPackageTitle", () => {
  it("adds the brand and cleans stray whitespace", () => {
    expect(buildPackageTitle("  Habarana Cottages and Rooms ")).toBe(
      "Habarana Cottages and Rooms | Ceylon Safari"
    )
  })
})
