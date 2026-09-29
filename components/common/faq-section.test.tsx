import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { getFaqs, type FaqVariant } from "./faq-data"
import FAQSection from "./faq-section"

const decode = (html: string) =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")

describe.each<FaqVariant>(["safari", "booking"])("%s FAQ", (variant) => {
  it("has only complete sentences", () => {
    for (const faq of getFaqs(variant)) {
      expect(faq.answer.trim()).toMatch(/[.!?]$/)
    }
  })

  it("renders every answer into server HTML, including closed items", () => {
    const html = decode(renderToStaticMarkup(<FAQSection variant={variant} />))
    for (const faq of getFaqs(variant)) {
      expect(html).toContain(faq.answer)
    }
  })
})

it("renders a different set per variant", () => {
  const safari = getFaqs("safari").map((faq) => faq.question)
  const booking = getFaqs("booking").map((faq) => faq.question)
  expect(safari).not.toEqual(booking)
})

it("never promises a cancellation policy the owner has not confirmed", () => {
  const answer = getFaqs("booking").find((faq) =>
    faq.question.toLowerCase().includes("cancellation")
  )?.answer
  expect(answer).toBeDefined()
  expect(answer).not.toMatch(/refund|free cancellation|non-refundable/i)
})
