import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SeasonStrip } from "./season-strip"

describe("SeasonStrip", () => {
  it("renders nothing without usable season data", () => {
    expect(renderToStaticMarkup(<SeasonStrip />)).toBe("")
    expect(
      renderToStaticMarkup(<SeasonStrip season={{ peak: [0, 13], good: [] }} />)
    ).toBe("")
  })

  it("renders 12 months with an accessible summary", () => {
    const html = renderToStaticMarkup(
      <SeasonStrip season={{ peak: [8, 9], good: [7] }} />
    )
    expect(html.match(/data-level=/g)).toHaveLength(12)
    expect(html.match(/data-level="peak"/g)).toHaveLength(2)
    expect(html).toContain('aria-label="Best: Aug–Sep. Good: Jul."')
  })

  it("labels unmarked months without a judgement", () => {
    const html = renderToStaticMarkup(
      <SeasonStrip season={{ peak: [8], good: [] }} />
    )
    expect(html).toContain('title="Jan"')
    expect(html).not.toMatch(/quiet|low season|avoid/i)
  })

  it("the small size omits the caption but keeps the accessible summary", () => {
    const html = renderToStaticMarkup(
      <SeasonStrip season={{ peak: [8], good: [] }} size="sm" />
    )
    expect(html).toContain('aria-label="Best: Aug."')
    expect(html).not.toContain("<p")
  })
})
