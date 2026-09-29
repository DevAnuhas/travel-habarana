import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))

import BookingForm from "./booking-form"

const packages = [{ _id: "a".repeat(24), name: "Hurulu Eco Park Safari" }]

describe("BookingForm server render", () => {
  it("is visible before JavaScript runs and renders its fields", () => {
    const html = renderToStaticMarkup(<BookingForm packages={packages} />)
    expect(html).not.toMatch(/opacity:\s*0/)
    expect(html).toContain("Full Name")
    expect(html).toContain("Preferred Date")
  })

  it("renders with a server-provided package id (no useSearchParams)", () => {
    expect(() =>
      renderToStaticMarkup(
        <BookingForm packages={packages} initialPackageId={"a".repeat(24)} />
      )
    ).not.toThrow()
  })
})
