import { describe, expect, it } from "vitest"

import { buildWhatsAppUrl, TEL_HREF } from "./contact-links"

const messageOf = (url: string) => new URL(url).searchParams.get("text") ?? ""

describe("buildWhatsAppUrl", () => {
  it("targets the business number without a plus sign", () => {
    expect(
      buildWhatsAppUrl().startsWith("https://wa.me/94766675883?text=")
    ).toBe(true)
  })

  it("prefills blanks the visitor can fill in", () => {
    const message = messageOf(buildWhatsAppUrl())
    expect(message).toContain("Ceylon Safari")
    expect(message).toMatch(/Date:/)
    expect(message).toMatch(/People:/)
    expect(message).toMatch(/Pickup hotel:/)
  })

  it("names the package, trimmed, and survives & and quotes", () => {
    const url = buildWhatsAppUrl({ packageName: ' Village "Food" & Cooking ' })
    expect(new URL(url).searchParams.getAll("text")).toHaveLength(1)
    expect(messageOf(url)).toContain('"Village "Food" & Cooking"')
  })

  it("ignores a blank package name", () => {
    expect(messageOf(buildWhatsAppUrl({ packageName: "  " }))).toContain(
      "I'd like to ask about a safari."
    )
  })
})

it("TEL_HREF dials the E.164 number", () => {
  expect(TEL_HREF).toBe("tel:+94766675883")
})
