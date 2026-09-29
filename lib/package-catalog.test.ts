import { describe, expect, it } from "vitest"

import {
  inferCategory,
  selectRelatedPackages,
  sortPackages,
  type OrderablePackage,
} from "./package-catalog"

const item = (
  _id: string,
  extra: Partial<OrderablePackage> = {}
): OrderablePackage => ({
  _id,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...extra,
})

describe("sortPackages", () => {
  it("orders by sortOrder, unordered items last", () => {
    const sorted = sortPackages([
      item("unordered"),
      item("second", { sortOrder: 2 }),
      item("first", { sortOrder: 1 }),
    ])
    expect(sorted.map((p) => p._id)).toEqual(["first", "second", "unordered"])
  })

  it("treats sortOrder 0 as the first slot, not as unset", () => {
    const sorted = sortPackages([
      item("one", { sortOrder: 1 }),
      item("zero", { sortOrder: 0 }),
    ])
    expect(sorted.map((p) => p._id)).toEqual(["zero", "one"])
  })

  it("breaks ties newest first", () => {
    const sorted = sortPackages([
      item("older", { createdAt: "2025-01-01T00:00:00.000Z" }),
      item("newer", { createdAt: "2026-01-01T00:00:00.000Z" }),
    ])
    expect(sorted.map((p) => p._id)).toEqual(["newer", "older"])
  })

  it("does not mutate its input", () => {
    const input = [item("b", { sortOrder: 2 }), item("a", { sortOrder: 1 })]
    sortPackages(input)
    expect(input.map((p) => p._id)).toEqual(["b", "a"])
  })
})

describe("selectRelatedPackages", () => {
  const minneriya = item("minneriya", { category: "safari", sortOrder: 1 })
  const all = [
    item("polonnaruwa", { category: "tour", sortOrder: 6 }),
    minneriya,
    item("village", { category: "experience", sortOrder: 4 }),
    item("kaudulla", { category: "safari", sortOrder: 2 }),
    item("hurulu", { category: "safari", sortOrder: 3 }),
  ]

  it("prefers the same category and never includes the current package", () => {
    expect(selectRelatedPackages(minneriya, all).map((p) => p._id)).toEqual([
      "kaudulla",
      "hurulu",
      "village",
    ])
  })

  it("falls back to display order when the package has no category", () => {
    const loose = item("loose")
    expect(
      selectRelatedPackages(loose, [loose, ...all], 2).map((p) => p._id)
    ).toEqual(["minneriya", "kaudulla"])
  })

  it("returns an empty list when nothing else exists", () => {
    expect(selectRelatedPackages(minneriya, [minneriya])).toEqual([])
  })
})

describe("inferCategory", () => {
  // The 11 live slugs (www.ceylonsafari.com/packages, 29 Sep 2026); the 5 dev
  // slugs are a subset of these.
  it.each([
    ["hurulu-eco-park-safari", "safari"],
    ["minneriya-national-park-safari", "safari"],
    ["kaudulla-national-park-safari", "safari"],
    ["village-experience-tour", "experience"],
    ["sri-lankan-culinary-journey", "experience"],
    ["polonnaruwa-city-tours", "tour"],
    ["sigiriya-city-tours", "tour"],
    ["medirigiriya-vatadageya-tour", "tour"],
    ["srilankan-day-and-multi-day-tours", "tour"],
    ["explore-sri-lanka-a-complete-guide-to-every-city-tour", "tour"],
    ["habarana-cottages-and-rooms", "stay"],
  ])("%s → %s", (slug, expected) => {
    expect(inferCategory(slug, slug.replace(/-/g, " "))).toBe(expected)
  })

  it("uses the name when the slug says nothing", () => {
    expect(inferCategory("package-7", "Habarana Cooking Class")).toBe(
      "experience"
    )
  })

  it("returns undefined when nothing matches", () => {
    expect(inferCategory("misc", "Airport transfer")).toBeUndefined()
  })
})
