import { describe, expect, it } from "vitest"

import { buildOffer, formatPrice } from "./pricing"

describe("formatPrice", () => {
  it("formats USD per jeep", () => {
    expect(
      formatPrice({
        priceFrom: 45,
        priceCurrency: "USD",
        priceUnit: "per jeep",
      })
    ).toBe("From US$45 per jeep")
  })

  it("groups LKR thousands", () => {
    expect(
      formatPrice({
        priceFrom: 12000,
        priceCurrency: "LKR",
        priceUnit: "per person",
      })
    ).toBe("From LKR 12,000 per person")
  })

  it("keeps meaningful decimals", () => {
    expect(
      formatPrice({
        priceFrom: 17.5,
        priceCurrency: "USD",
        priceUnit: "per person",
      })
    ).toBe("From US$17.50 per person")
  })

  it.each([
    [{}],
    [{ priceFrom: 45 }],
    [{ priceFrom: 45, priceCurrency: "USD" as const }],
  ])("returns null when incomplete: %o", (price) => {
    expect(formatPrice(price)).toBeNull()
  })
})

describe("buildOffer", () => {
  const url = "https://www.ceylonsafari.com/packages/hurulu-eco-park-safari"
  const price = {
    priceFrom: 45,
    priceCurrency: "USD" as const,
    priceUnit: "per jeep" as const,
  }

  it("builds a schema.org Offer from price data", () => {
    expect(buildOffer(price, url)).toEqual({
      "@type": "Offer",
      price: 45,
      priceCurrency: "USD",
      url,
      description: "From US$45 per jeep",
    })
  })

  it("never asserts availability, because price does not establish it", () => {
    expect(buildOffer(price, url)).not.toHaveProperty("availability")
  })

  it("is omitted without a complete price", () => {
    expect(buildOffer({ priceFrom: 45 }, url)).toBeUndefined()
  })
})
