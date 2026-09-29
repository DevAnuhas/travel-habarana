import { describe, expect, it } from "vitest"

import {
  chooseAvailableSlug,
  planSlugChange,
  slugVariantPattern,
} from "./package-slugs"

describe("chooseAvailableSlug", () => {
  const redirects = [
    { source: "/packages/old-city-tour" },
    { source: "/blogs/minneriya-safari" },
  ]

  it("uses the name's slug when nothing else answers to it", () => {
    expect(chooseAvailableSlug("Minneriya Safari", [], redirects)).toBe(
      "minneriya-safari"
    )
  })

  it("numbers the slug when another package has it now", () => {
    expect(
      chooseAvailableSlug("Minneriya Safari", [{ slug: "minneriya-safari" }], [])
    ).toBe("minneriya-safari-2")
  })

  // A renamed package keeps its old URL; handing it to another package would
  // silently point indexed links at the wrong tour.
  it("never hands out another package's old URL", () => {
    const renamed = { slug: "minneriya-jeep-safari", previousSlugs: ["minneriya"] }
    expect(chooseAvailableSlug("Minneriya", [renamed], [])).toBe("minneriya-2")
  })

  // next.config redirects run before routes, so a package on a redirected
  // slug could never be reached.
  it("never uses a slug that a site redirect sends elsewhere", () => {
    expect(chooseAvailableSlug("Old City Tour", [], redirects)).toBe(
      "old-city-tour-2"
    )
  })

  it("ignores redirects outside /packages", () => {
    expect(chooseAvailableSlug("Minneriya Safari", [], redirects)).toBe(
      "minneriya-safari"
    )
  })

  it("takes the first free number", () => {
    const others = [
      { slug: "hurulu" },
      { slug: "x", previousSlugs: ["hurulu-2"] },
      { slug: "hurulu-4" },
    ]
    expect(chooseAvailableSlug("Hurulu", others, [])).toBe("hurulu-3")
  })

  it("tolerates packages without history", () => {
    expect(
      chooseAvailableSlug(
        "Hurulu",
        [{ slug: "hurulu", previousSlugs: null }, { previousSlugs: undefined }],
        []
      )
    ).toBe("hurulu-2")
  })

  it("falls back to a readable slug when the name has no URL characters", () => {
    expect(chooseAvailableSlug("🐘 !!", [], [])).toBe("package")
    expect(chooseAvailableSlug("🐘", [{ slug: "package" }], [])).toBe(
      "package-2"
    )
  })
})

describe("slugVariantPattern", () => {
  const pattern = slugVariantPattern("hurulu-safari")

  it("matches the slug and its numbered variants", () => {
    for (const slug of ["hurulu-safari", "hurulu-safari-2", "hurulu-safari-4821"])
      expect(pattern.test(slug)).toBe(true)
  })

  it("does not match longer or different slugs", () => {
    for (const slug of [
      "hurulu-safari-tour",
      "big-hurulu-safari",
      "hurulu-safarix",
      "hurulu",
    ])
      expect(pattern.test(slug)).toBe(false)
  })

  it("treats the slug literally", () => {
    expect(slugVariantPattern("a.b").test("axb")).toBe(false)
  })
})

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
