import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { PublicPackage } from "@/lib/package-serialize"
import HeroSection from "./hero-section"
import { HowBookingWorks } from "./how-booking-works"
import { MoreExperiences } from "./more-experiences"
import { ParkChooser } from "./park-chooser"

const make = (id: string, extra: Partial<PublicPackage>): PublicPackage => ({
  _id: id.padEnd(24, "0"),
  slug: id,
  name: id,
  description: "d",
  duration: "3 hours",
  included: [],
  images: [],
  ...extra,
})

const safaris = [
  make("minneriya", {
    category: "safari",
    sortOrder: 1,
    priceFrom: 45,
    priceCurrency: "USD",
    priceUnit: "per jeep",
  }),
  make("hurulu", { category: "safari", sortOrder: 2 }),
]

// Visible text only; hrefs legitimately carry the brand and prefill.
const visibleText = (html: string) => html.replace(/<[^>]+>/g, " ")

describe("HeroSection", () => {
  it("answers what, duration, price, trust and WhatsApp for each safari", () => {
    const html = renderToStaticMarkup(<HeroSection safaris={safaris} />)
    expect(html).toContain("<h1")
    expect(html).toContain("data-trust")
    expect(html).toContain("wa.me")
    expect(html.match(/data-fact="duration"/g)).toHaveLength(2)
    expect(html.match(/data-quick-pick/g)).toHaveLength(2)
    expect(html.match(/data-qp-name/g)).toHaveLength(2)
    expect(html).toContain("From US$45 per jeep")
    expect(html).toContain("Price on request")
    expect(html).toContain('href="/packages/hurulu"')
  })

  it("makes no service claims", () => {
    expect(
      visibleText(renderToStaticMarkup(<HeroSection safaris={safaris} />))
    ).not.toMatch(/private|free|pickup from|guide/i)
  })

  it("still renders without safaris, just without quick picks", () => {
    const html = renderToStaticMarkup(<HeroSection safaris={[]} />)
    expect(html).toContain("<h1")
    expect(html).not.toContain('data-fact="duration"')
  })
})

describe("ParkChooser and MoreExperiences", () => {
  it("chooser shows safaris in order with neutral advice", () => {
    const html = renderToStaticMarkup(<ParkChooser safaris={safaris} />)
    expect(html.indexOf("/packages/minneriya")).toBeLessThan(
      html.indexOf("/packages/hurulu")
    )
    expect(html).toContain("Not sure which park?")
    expect(visibleText(html)).not.toMatch(/herds are|that week/i)
  })

  it("chooser renders nothing without safaris", () => {
    expect(renderToStaticMarkup(<ParkChooser safaris={[]} />)).toBe("")
  })

  it("more experiences shows only non-safaris and renders nothing without them", () => {
    const html = renderToStaticMarkup(
      <MoreExperiences
        packages={[make("village", { category: "experience" }), ...safaris]}
      />
    )
    expect(html).toContain("/packages/village")
    expect(html).not.toContain("/packages/minneriya")
    expect(renderToStaticMarkup(<MoreExperiences packages={safaris} />)).toBe(
      ""
    )
  })
})

it("how booking works describes the process only", () => {
  const html = renderToStaticMarkup(<HowBookingWorks />)
  expect(html).toContain("<ol")
  expect(visibleText(html)).not.toMatch(/free|private|Sigiriya|Dambulla/i)
})
