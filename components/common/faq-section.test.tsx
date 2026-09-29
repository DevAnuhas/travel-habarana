// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { getFaqs, type FaqVariant } from "./faq-data"
import FAQSection from "./faq-section"

const decode = (html: string) =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")

const parse = (element: React.ReactElement) =>
  new DOMParser().parseFromString(renderToStaticMarkup(element), "text/html")

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

  // A closed answer must actually be closed: Radix forceMount left collapsed
  // answers on screen while their triggers announced aria-expanded="false".
  it("gives each answer its own native disclosure, first one open", () => {
    const faqs = getFaqs(variant)
    const doc = parse(<FAQSection variant={variant} />)
    const items = [...doc.querySelectorAll("details")]

    expect(
      items.map((item) => item.querySelector("summary")?.textContent)
    ).toEqual(faqs.map((faq) => faq.question))
    items.forEach((item, index) =>
      expect(item.textContent).toContain(faqs[index].answer)
    )
    expect(items.map((item) => item.open)).toEqual(
      faqs.map((_, index) => index === 0)
    )
    expect(doc.querySelector("[aria-expanded]")).toBeNull()
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
