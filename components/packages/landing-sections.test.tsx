import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FinalCta } from "@/components/common/final-cta"
import type { PublicPackage } from "@/lib/package-serialize"
import { BookingPanel } from "./booking-panel"
import {
  AboutExperience,
  FactChips,
  Highlights,
  IncludedList,
  Itinerary,
  PackageFaqs,
  PackageHeader,
  PickupAndTimes,
  WhatToBring,
  WhenToGo,
} from "./landing-sections"
import { PackageGallery, spanFor } from "./package-gallery"

const html = (node: React.ReactElement) => renderToStaticMarkup(node)
const nestedControl = /<a\s[^>]*>(?:(?!<\/a>)[\s\S])*<(?:a|button)\s/
const pkg: PublicPackage = {
  _id: "a".repeat(24),
  slug: "village-experience-tour",
  name: "Village Experience Tour",
  description: "First paragraph.\n\nSecond paragraph.",
  duration: "4 hours",
  included: ["Lunch"],
  images: [],
  category: "experience",
}

describe("sections omit themselves without usable data", () => {
  it.each([
    ["Highlights", <Highlights key="h" />],
    ["WhenToGo (none)", <WhenToGo key="w1" />],
    [
      "WhenToGo (all months invalid)",
      <WhenToGo key="w2" season={{ peak: [0, 13], good: [] }} />,
    ],
    ["Itinerary", <Itinerary key="i" steps={[]} />],
    ["PickupAndTimes", <PickupAndTimes key="p" />],
    ["WhatToBring", <WhatToBring key="b" />],
    ["PackageFaqs", <PackageFaqs key="f" />],
    ["IncludedList", <IncludedList key="n" included={[]} />],
    ["AboutExperience", <AboutExperience key="a" description={"  \n\n "} />],
  ])("%s", (_name, node) => {
    expect(html(node)).toBe("")
  })
})

describe("sections with data", () => {
  it("WhenToGo renders once overlapping or duplicate months are normalised", () => {
    const out = html(<WhenToGo season={{ peak: [8, 8], good: [8, 7] }} />)
    expect(out).toContain("When to go")
    expect(out.match(/data-level="peak"/g)).toHaveLength(1)
  })

  it("renders the itinerary as an ordered list with times", () => {
    const out = html(
      <Itinerary
        steps={[{ time: "2:30 pm", title: "Pickup" }, { title: "Game drive" }]}
      />
    )
    expect(out).toContain("<ol")
    expect(out).toContain("2:30 pm")
  })

  it("renders every FAQ answer in server HTML", () => {
    expect(
      html(
        <PackageFaqs
          faqs={[{ question: "Private?", answer: "Yes, only your group." }]}
        />
      )
    ).toContain("Yes, only your group.")
  })

  it("pickup never claims to be free", () => {
    const out = html(<PickupAndTimes pickupAreas={["Habarana"]} />)
    expect(out).toContain("Hotel pickup from")
    expect(out).not.toMatch(/free/i)
  })

  it("splits the description into paragraphs", () => {
    expect(
      html(<AboutExperience description={pkg.description} />).match(/<p/g)
    ).toHaveLength(2)
  })

  it("fact chips show only known facts and mark duration", () => {
    const out = html(
      <FactChips duration="3 hours" pickupAreas={["Habarana"]} />
    )
    expect(out).toContain('data-fact="duration"')
    expect(out).toContain("Hotel pickup")
    expect(out).not.toContain("per jeep")
  })
})

describe("PackageHeader: first-viewport facts", () => {
  it("has the H1, price (or on request), trust, duration and WhatsApp, in that order", () => {
    const out = html(<PackageHeader pkg={pkg} />)
    const order = [
      "<h1",
      "data-price",
      "data-trust",
      'data-fact="duration"',
      "wa.me",
    ].map((needle) => out.indexOf(needle))
    expect(order.every((index) => index >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(out).toContain("Price on request")
  })
})

describe("BookingPanel", () => {
  it("offers price on request, WhatsApp, call and the form, with no nested controls or opacity", () => {
    const out = html(<BookingPanel pkg={pkg} />)
    expect(out).toContain("Price on request")
    expect(out).toContain('href="tel:+94766675883"')
    expect(out).toContain(`/book-now?packageId=${"a".repeat(24)}`)
    expect(out).not.toMatch(nestedControl)
    expect(out).not.toMatch(/opacity:\s*0/)
  })

  it("makes no service claims of its own", () => {
    expect(
      html(<BookingPanel pkg={{ ...pkg, category: "safari" }} />)
    ).not.toMatch(/free cancellation|instant confirmation|private jeep/i)
  })
})

describe("PackageGallery", () => {
  it("renders a placeholder and no images when there are none", () => {
    const out = html(<PackageGallery images={[]} name="X" />)
    expect(out).not.toContain("<img")
    expect(out).toContain('aria-label="No photos yet"')
  })

  it("renders the lead image once, marked as lead, keeping each description on its own photo", () => {
    const a = "https://res.cloudinary.com/a.jpg"
    const b = "https://res.cloudinary.com/b.jpg"
    // Only the SECOND photo is described: it must not shift onto the first.
    const out = html(
      <PackageGallery
        images={[a, b]}
        name="X"
        alts={{ [b]: "Elephants at the tank" }}
      />
    )
    expect(out.match(/<img/g)).toHaveLength(2)
    expect(out.match(/data-lead-image/g)).toHaveLength(1)
    expect(out).toContain('alt="X, photo 1"')
    expect(out).toContain('alt="Elephants at the tank"')
    expect(out.indexOf('alt="X, photo 1"')).toBeLessThan(
      out.indexOf('alt="Elephants at the tank"')
    )
  })

  it("caps the mobile strip at 8 photos", () => {
    const images = Array.from(
      { length: 12 },
      (_, i) => `https://res.cloudinary.com/${i}.jpg`
    )
    expect(
      html(<PackageGallery images={images} name="X" />).match(/<img/g)
    ).toHaveLength(8)
  })

  it.each([2, 3, 4, 5])("mosaic spans fill 8 cells with %i images", (count) => {
    const cells = (span: string) =>
      span.includes("row-span-2") ? 4 : span.includes("col-span-2") ? 2 : 1
    expect(
      Array.from({ length: count }, (_, i) => cells(spanFor(i, count))).reduce(
        (a, b) => a + b,
        0
      )
    ).toBe(8)
  })
})

describe("FinalCta", () => {
  it("is generic by default so non-safari pages promise no park or elephants", () => {
    // Visible text only: hrefs legitimately carry the brand name and prefill.
    const visible = html(<FinalCta />).replace(/<[^>]+>/g, " ")
    expect(visible).not.toMatch(/elephant|park|safari/i)
  })

  it("takes a page-specific title", () => {
    expect(html(<FinalCta title="Ready to book your safari?" />)).toContain(
      "Ready to book your safari?"
    )
  })
})
