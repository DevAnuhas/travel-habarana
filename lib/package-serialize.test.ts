import { describe, expect, it } from "vitest"

import { serializePackage, type PackageDocument } from "./package-serialize"

const base: PackageDocument = {
  _id: "a".repeat(24),
  slug: "hurulu-eco-park-safari",
  name: "Hurulu Eco Park Safari ",
  description: "A jeep safari.",
  duration: "3 hours",
  included: ["Jeep"],
  images: ["https://res.cloudinary.com/demo/hurulu.jpg"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
}

describe("serializePackage", () => {
  it("keeps a legacy package intact, trims the name and infers its category", () => {
    const result = serializePackage(base)
    expect(result).toMatchObject({
      _id: "a".repeat(24),
      name: "Hurulu Eco Park Safari",
      category: "safari",
      createdAt: "2026-01-01T00:00:00.000Z",
    })
    expect(result.summary).toBeUndefined()
    expect(result.season).toBeUndefined()
    expect(result.imageAlts).toBeUndefined()
  })

  it("prefers the admin category over the inferred one", () => {
    expect(serializePackage({ ...base, category: "tour" }).category).toBe(
      "tour"
    )
  })

  it("maps null, blank strings and empty lists to undefined", () => {
    const result = serializePackage({
      ...base,
      summary: "  ",
      highlights: [],
      faqs: null,
      season: { peak: [], good: [] },
      priceFrom: null,
      imageAlts: [],
    })
    expect(result.summary).toBeUndefined()
    expect(result.highlights).toBeUndefined()
    expect(result.faqs).toBeUndefined()
    expect(result.season).toBeUndefined()
    expect(result.priceFrom).toBeUndefined()
    expect(result.imageAlts).toBeUndefined()
  })

  it("keys image descriptions by URL, so order and gaps never mislabel a photo", () => {
    const a = "https://res.cloudinary.com/demo/a.jpg"
    const b = "https://res.cloudinary.com/demo/b.jpg"
    const c = "https://res.cloudinary.com/demo/c.jpg"
    // Photo A has no description; B does. The admin reorders to [B, A] and removes C.
    const result = serializePackage({
      ...base,
      images: [b, a],
      imageAlts: [
        { src: b, alt: "Herd at the tank" },
        { src: c, alt: "Removed photo" },
      ],
    })
    expect(result.imageAlts).toEqual({ [b]: "Herd at the tank" })
    expect(result.imageAlts?.[a]).toBeUndefined()
  })

  it("uses the last description when the same image appears twice", () => {
    const a = "https://res.cloudinary.com/demo/a.jpg"
    const result = serializePackage({
      ...base,
      images: [a],
      imageAlts: [
        { src: a, alt: "Old" },
        { src: a, alt: "New" },
      ],
    })
    expect(result.imageAlts).toEqual({ [a]: "New" })
  })

  it("normalises season and itinerary", () => {
    const result = serializePackage({
      ...base,
      itinerary: [{ time: null, title: " Pickup ", detail: null }],
      season: { peak: [8, 13], good: [8, 7] },
    })
    expect(result.itinerary).toEqual([{ title: "Pickup" }])
    expect(result.season).toEqual({ peak: [8], good: [7] })
  })
})
