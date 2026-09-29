import { describe, expect, it } from "vitest"

import { planSlugChange } from "./package-slugs"

describe("planSlugChange", () => {
  it("leaves state alone when the slug does not change", () => {
    expect(
      planSlugChange({ slug: "hurulu", previousSlugs: ["old"] }, "hurulu")
    ).toEqual({ slug: "hurulu", previousSlugs: ["old"] })
  })

  it("records the outgoing slug", () => {
    expect(
      planSlugChange(
        { slug: "srilankan-tours", previousSlugs: [] },
        "sri-lanka-tours"
      )
    ).toEqual({ slug: "sri-lanka-tours", previousSlugs: ["srilankan-tours"] })
  })

  it("keeps older history without duplicates", () => {
    expect(
      planSlugChange({ slug: "b", previousSlugs: ["a", "b"] }, "c")
    ).toEqual({ slug: "c", previousSlugs: ["a", "b"] })
  })

  it("drops the new slug from history when reverting to an earlier name", () => {
    expect(planSlugChange({ slug: "b", previousSlugs: ["a"] }, "a")).toEqual({
      slug: "a",
      previousSlugs: ["b"],
    })
  })

  it("does not mutate the input", () => {
    const history = ["a"]
    planSlugChange({ slug: "b", previousSlugs: history }, "c")
    expect(history).toEqual(["a"])
  })
})
