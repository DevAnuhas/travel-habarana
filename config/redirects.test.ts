import { describe, expect, it } from "vitest"

import { contentRedirects } from "./redirects"

describe("contentRedirects", () => {
  it("has unique sources", () => {
    const sources = contentRedirects.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it("never chains: no destination is also a source", () => {
    const sources = new Set(contentRedirects.map((r) => r.source))
    for (const redirect of contentRedirects) {
      expect(sources.has(redirect.destination)).toBe(false)
    }
  })

  it("is permanent and site-relative", () => {
    for (const redirect of contentRedirects) {
      expect(redirect.permanent).toBe(true)
      expect(redirect.destination.startsWith("/")).toBe(true)
    }
  })

  it("keeps the three consolidated Habarana article slugs", () => {
    for (const slug of [
      "habarana-safari-jeep",
      "habarana-elephant-jeep-safari",
      "habaranaelephantjeepsafari",
    ]) {
      expect(
        contentRedirects.find((r) => r.source === `/blogs/${slug}`)
          ?.destination
      ).toBe("/blogs/habarana-jeep-safari")
    }
  })

  it("folds the duplicate Minneriya posts into the main guide", () => {
    for (const slug of [
      "minneriya-national-park-jeep-safari",
      "minneriya-jeep-safari-habarana",
    ]) {
      expect(
        contentRedirects.find((r) => r.source === `/blogs/${slug}`)
          ?.destination
      ).toBe("/blogs/minneriya-jeep-safari")
    }
  })

  it("recovers the deleted Minneriya + Kaudulla package URL", () => {
    expect(
      contentRedirects.find(
        (r) =>
          r.source ===
          "/packages/habarana-safari-tour-minneriya-and-kaudulla-nationalpark"
      )?.destination
    ).toBe("/packages/minneriya-national-park-safari")
  })

  it("no longer carries rules for the dropped travelhabarana.com domain", () => {
    expect(JSON.stringify(contentRedirects)).not.toContain("travelhabarana")
  })
})
