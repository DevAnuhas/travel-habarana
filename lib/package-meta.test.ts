import { describe, expect, it } from "vitest"

import type { PublicPackage } from "./package-serialize"
import { resolvePackageMeta } from "./package-meta"

const pkg = {
  _id: "a".repeat(24),
  slug: "hurulu-eco-park-safari",
  name: "Hurulu Eco Park Safari",
  description:
    "Embark on a jeep safari through Hurulu Eco Park, where herds of wild elephants gather near the reservoir and our local guide explains their behaviour along the way for you.",
  duration: "3 hours",
  included: [],
  images: [],
} satisfies PublicPackage

describe("resolvePackageMeta", () => {
  it("prefers the admin SEO fields and adds the brand", () => {
    expect(
      resolvePackageMeta({
        ...pkg,
        seoTitle: "Hurulu Jeep Safari from Habarana",
        seoDescription: "Short.",
      })
    ).toEqual({
      title: "Hurulu Jeep Safari from Habarana | Ceylon Safari",
      description: "Short.",
    })
  })

  it("does not double the brand", () => {
    expect(
      resolvePackageMeta({ ...pkg, seoTitle: "Hurulu Safari | Ceylon Safari" })
        .title
    ).toBe("Hurulu Safari | Ceylon Safari")
  })

  it("falls back to name, then summary, then a word-safe description", () => {
    expect(resolvePackageMeta(pkg).title).toBe(
      "Hurulu Eco Park Safari | Ceylon Safari"
    )
    expect(
      resolvePackageMeta({ ...pkg, summary: "Elephants at Hurulu." })
        .description
    ).toBe("Elephants at Hurulu.")
    const description = resolvePackageMeta(pkg).description
    expect(description.length).toBeLessThanOrEqual(160)
    expect(description.endsWith("…")).toBe(true)
  })
})
