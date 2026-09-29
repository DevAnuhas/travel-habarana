import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ContactActions } from "./contact-actions"

describe("ContactActions", () => {
  const html = renderToStaticMarkup(
    <ContactActions packageName="Hurulu Eco Park Safari" />
  )

  it("links WhatsApp with the package prefilled in a new tab", () => {
    expect(html).toContain('href="https://wa.me/94766675883?text=')
    expect(html).toContain(encodeURIComponent("Hurulu Eco Park Safari"))
    expect(html).toContain('target="_blank"')
  })

  it("offers a tel: link that shows the number", () => {
    expect(html).toContain('href="tel:+94766675883"')
    expect(html).toContain("+94 76 667 5883")
  })

  it("compact mode keeps full accessible names with short labels", () => {
    const compact = renderToStaticMarkup(<ContactActions compact />)
    expect(compact).toContain('aria-label="Ask on WhatsApp"')
    expect(compact).toContain('aria-label="Call +94 76 667 5883"')
    expect(compact).not.toContain(">Ask on WhatsApp<")
  })

  it("never nests a button inside a link", () => {
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>)[\s\S])*<button/)
  })
})
