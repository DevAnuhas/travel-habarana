import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { PublicPackage } from "@/lib/package-serialize"
import PackageCard from "./package-card"

const pkg: PublicPackage = {
  _id: "a".repeat(24),
  slug: "minneriya-national-park-safari",
  name: "Minneriya National Park Safari",
  description: "Long description that must not be repeated on cards.",
  duration: "3 hours",
  included: ["Private jeep", "Water"],
  images: ["https://res.cloudinary.com/travelhabarana/image/upload/x.jpg"],
  category: "safari",
  summary: "Elephants at the tank.",
}

describe("PackageCard", () => {
  it("shows summary, duration and price on request without repeating included or description", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={pkg} />)
    expect(html).toContain("Elephants at the tank.")
    expect(html).toContain('data-fact="duration"')
    expect(html).toContain("Price on request")
    expect(html).not.toContain("Long description")
    expect(html).not.toContain("Water")
  })

  it("shows the from-price when set", () => {
    const html = renderToStaticMarkup(
      <PackageCard
        pkg={{
          ...pkg,
          priceFrom: 45,
          priceCurrency: "USD",
          priceUnit: "per jeep",
        }}
      />
    )
    expect(html).toContain("From US$45 per jeep")
  })

  it("keeps the WhatsApp link outside the card link and nests no controls", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={pkg} />)
    expect(html).not.toMatch(/<a\s[^>]*>(?:(?!<\/a>)[\s\S])*<a\s/)
    expect(html).not.toMatch(/<a\s[^>]*>(?:(?!<\/a>)[\s\S])*<button/)
    expect(html).toContain("wa.me")
  })

  it("uses the admin photo description as alt text", () => {
    const html = renderToStaticMarkup(
      <PackageCard
        pkg={{
          ...pkg,
          imageAlts: { [pkg.images[0]]: "Elephants drinking at the tank" },
        }}
      />
    )
    expect(html).toContain('alt="Elephants drinking at the tank"')
  })

  it("falls back to a truncated description without a summary", () => {
    expect(
      renderToStaticMarkup(<PackageCard pkg={{ ...pkg, summary: undefined }} />)
    ).toContain("Long description")
  })

  it("renders a placeholder, not a broken image, without photos", () => {
    const html = renderToStaticMarkup(
      <PackageCard pkg={{ ...pkg, images: [] }} />
    )
    expect(html).not.toContain("<img")
  })
})
