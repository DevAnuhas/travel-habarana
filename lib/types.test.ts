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
