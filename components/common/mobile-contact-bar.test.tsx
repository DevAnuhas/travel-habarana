import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { MobileContactBar } from "./mobile-contact-bar"

describe("MobileContactBar", () => {
  const html = renderToStaticMarkup(<MobileContactBar />)

  it("is sticky in normal flow (never fixed), so it settles above the footer", () => {
    expect(html).toContain("sticky")
    expect(html).toContain("bottom-0")
    expect(html).not.toMatch(/\bfixed\b/)
  })

  it("shows below the navbar breakpoint only and pads for the safe area", () => {
    expect(html).toContain("lg:hidden")
    expect(html).toContain("env(safe-area-inset-bottom")
    expect(html).toContain("data-contact-bar")
  })

  it("shows the price and prefills the package when given", () => {
    const withPrice = renderToStaticMarkup(
      <MobileContactBar
        packageName="Minneriya Safari"
        price={{ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }}
      />
    )
    expect(withPrice).toContain("From US$45 per jeep")
    expect(withPrice).toContain("data-price")
    expect(withPrice).toContain(encodeURIComponent("Minneriya Safari"))
  })

  it("says price on request for a package without a price", () => {
    expect(
      renderToStaticMarkup(
        <MobileContactBar packageName="Village Tour" price={{}} />
      )
    ).toContain("Price on request")
  })

  it("shows no price line on pages that are not about one package", () => {
    expect(html).not.toContain("data-price")
  })
})
