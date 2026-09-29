import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { inquiryRequestSchema, packageSchema } from "./types"

const inquiry = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+44 7700 900123",
  packageId: "a".repeat(24),
  numberOfPeople: 2,
}

describe("inquiryRequestSchema date rule", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-29T04:30:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("accepts today's date sent from Sri Lanka", () => {
    const result = inquiryRequestSchema.safeParse({
      ...inquiry,
      date: "2026-09-28T18:30:00.000Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a date two days in the past", () => {
    const result = inquiryRequestSchema.safeParse({
      ...inquiry,
      date: "2026-09-27T00:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })
})


const legacyPackage = {
  name: "Hurulu Eco Park Safari",
  description: "A private jeep safari through Hurulu Eco Park.",
  duration: "3-4 hours",
  included: ["Private jeep"],
  images: ["https://res.cloudinary.com/demo/image/upload/hurulu.jpg"],
}

describe("packageSchema merchandising fields", () => {
  it("accepts a legacy package with none of the new fields", () => {
    expect(packageSchema.safeParse(legacyPackage).success).toBe(true)
  })

  it("accepts a fully merchandised package", () => {
    const result = packageSchema.safeParse({
      ...legacyPackage,
      category: "safari",
      sortOrder: 1,
      priceFrom: 45,
      priceCurrency: "USD",
      priceUnit: "per jeep",
      priceNote: "Park tickets not included",
    })
    expect(result.success).toBe(true)
  })

  it("keeps the merchandising values it accepts", () => {
    const result = packageSchema.parse({
      ...legacyPackage,
      category: "safari",
      priceFrom: 45,
      priceCurrency: "USD",
      priceUnit: "per jeep",
    })
    expect(result).toMatchObject({
      category: "safari",
      priceFrom: 45,
      priceCurrency: "USD",
      priceUnit: "per jeep",
    })
  })

  it("accepts nulls so the admin can clear a field", () => {
    const result = packageSchema.safeParse({
      ...legacyPackage,
      category: null,
      sortOrder: null,
      priceFrom: null,
      priceCurrency: null,
      priceUnit: null,
      priceNote: null,
    })
    expect(result.success).toBe(true)
  })

  it("requires currency and unit when a price is set", () => {
    const result = packageSchema.safeParse({ ...legacyPackage, priceFrom: 45 })
    expect(result.success).toBe(false)
  })

  it.each([
    [
      "negative price",
      { priceFrom: -1, priceCurrency: "USD", priceUnit: "per jeep" },
    ],
    [
      "NaN price",
      { priceFrom: Number.NaN, priceCurrency: "USD", priceUnit: "per jeep" },
    ],
    ["unknown category", { category: "cruise" }],
    ["fractional sort order", { sortOrder: 1.5 }],
  ])("rejects %s", (_label, extra) => {
    expect(
      packageSchema.safeParse({ ...legacyPackage, ...extra }).success
    ).toBe(false)
  })
})

describe("packageSchema landing fields", () => {
  const landing = {
    summary:
      "See the elephant gathering at Minneriya tank in a jeep with a local guide.",
    seoTitle: "Minneriya National Park Jeep Safari from Habarana",
    seoDescription: "Minneriya jeep safari from Habarana.",
    groupSize: "Up to 6 per jeep",
    highlights: ["Elephant herds at the tank"],
    notIncluded: ["Park entrance tickets"],
    timeSlots: ["6:00 am", "2:30 pm"],
    pickupAreas: ["Habarana", "Sigiriya"],
    whatToBring: ["Hat"],
    itinerary: [
      { time: "2:30 pm", title: "Hotel pickup", detail: "In an open jeep" },
    ],
    faqs: [
      {
        question: "Is it private?",
        answer: "Yes, the jeep is only for your group.",
      },
    ],
    season: { peak: [8, 9], good: [7, 10] },
    imageAlts: [
      {
        src: "https://res.cloudinary.com/demo/image/upload/hurulu.jpg",
        alt: "Elephants at the tank at sunset",
      },
    ],
  }

  it("accepts a full landing payload and keeps it", () => {
    const result = packageSchema.parse({ ...legacyPackage, ...landing })
    expect(result).toMatchObject(landing)
  })

  it("accepts null for every landing field", () => {
    const nulls = Object.fromEntries(
      Object.keys(landing).map((key) => [key, null])
    )
    expect(
      packageSchema.safeParse({ ...legacyPackage, ...nulls }).success
    ).toBe(true)
  })

  it.each([
    [
      "too many highlights",
      { highlights: Array.from({ length: 9 }, (_, i) => `Highlight ${i}`) },
    ],
    ["month 13", { season: { peak: [13], good: [] } }],
    ["month 0", { season: { peak: [], good: [0] } }],
    ["duplicate month", { season: { peak: [8, 8], good: [] } }],
    ["peak and good overlap", { season: { peak: [8], good: [8] } }],
    [
      "FAQ without answer",
      { faqs: [{ question: "Is it private?", answer: "" }] },
    ],
    ["summary over 220 chars", { summary: "a".repeat(221) }],
    [
      "alt over 150 chars",
      {
        imageAlts: [
          { src: "https://res.cloudinary.com/x.jpg", alt: "a".repeat(151) },
        ],
      },
    ],
    [
      "alt with blank text",
      { imageAlts: [{ src: "https://res.cloudinary.com/x.jpg", alt: "  " }] },
    ],
    [
      "alt with a non-URL src",
      { imageAlts: [{ src: "not a url", alt: "Elephants" }] },
    ],
  ])("rejects %s", (_label, extra) => {
    expect(
      packageSchema.safeParse({ ...legacyPackage, ...extra }).success
    ).toBe(false)
  })
})
