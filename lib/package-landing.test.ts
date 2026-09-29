import { describe, expect, it } from "vitest"

import { withImageAlt } from "@/components/admin/image-alt-fields"
import {
  formatFaqs,
  formatItinerary,
  formatLines,
  parseFaqs,
  parseItinerary,
  parseLines,
  splitParagraphs,
} from "./package-landing"

describe("parseLines / formatLines", () => {
  it("drops blank and whitespace-only lines and trims", () => {
    expect(parseLines(" Hat \n\n   \nSunscreen\r\n")).toEqual([
      "Hat",
      "Sunscreen",
    ])
  })

  it("round-trips", () => {
    expect(parseLines(formatLines(["Hat", "Water"]))).toEqual(["Hat", "Water"])
    expect(formatLines(null)).toBe("")
  })
})

describe("parseItinerary", () => {
  it("reads time | title | detail", () => {
    expect(parseItinerary("2:30 pm | Hotel pickup | Open jeep")).toEqual([
      { time: "2:30 pm", title: "Hotel pickup", detail: "Open jeep" },
    ])
  })

  it("treats a line without a separator as a title", () => {
    expect(parseItinerary("Enter the park")).toEqual([
      { title: "Enter the park" },
    ])
  })

  it("allows a missing time and keeps extra pipes in the detail", () => {
    expect(parseItinerary(" | Drive to the tank | Herds | birds")).toEqual([
      { title: "Drive to the tank", detail: "Herds | birds" },
    ])
  })

  it("falls back to a title when only a time is given", () => {
    expect(parseItinerary("6:00 am |")).toEqual([{ title: "6:00 am" }])
  })

  it("round-trips through formatItinerary", () => {
    const steps = [
      { time: "2:30 pm", title: "Pickup" },
      { title: "Game drive", detail: "About 3 hours" },
      { title: "Drop-off" },
    ]
    expect(parseItinerary(formatItinerary(steps))).toEqual(steps)
  })
})

describe("parseFaqs", () => {
  it("reads blocks separated by blank lines", () => {
    expect(
      parseFaqs(
        "Is it private?\nYes, only your group.\n\nDo you pick up?\nYes, from Habarana.\nAnd Sigiriya."
      )
    ).toEqual({
      faqs: [
        { question: "Is it private?", answer: "Yes, only your group." },
        {
          question: "Do you pick up?",
          answer: "Yes, from Habarana. And Sigiriya.",
        },
      ],
      dropped: 0,
    })
  })

  it("drops and counts blocks with no answer", () => {
    expect(parseFaqs("Lonely question?\n\nQ one?\nA one.")).toEqual({
      faqs: [{ question: "Q one?", answer: "A one." }],
      dropped: 1,
    })
  })

  it("round-trips through formatFaqs", () => {
    const faqs = [
      { question: "Q one?", answer: "A one." },
      { question: "Q two?", answer: "A two." },
    ]
    expect(parseFaqs(formatFaqs(faqs)).faqs).toEqual(faqs)
  })
})

it("splitParagraphs splits on blank lines and collapses inner whitespace", () => {
  expect(splitParagraphs("One\nline.\n\n\nTwo  here.\n")).toEqual([
    "One line.",
    "Two here.",
  ])
})

describe("withImageAlt", () => {
  const a = "https://x/a.jpg"
  const b = "https://x/b.jpg"

  it("describes the second photo without touching the undescribed first", () => {
    expect(withImageAlt([a, b], null, b, "Herd")).toEqual([
      { src: b, alt: "Herd" },
    ])
  })

  it("replaces and clears one photo's description", () => {
    const one = withImageAlt([a, b], null, a, "Old")
    expect(withImageAlt([a, b], one, a, "New")).toEqual([
      { src: a, alt: "New" },
    ])
    expect(withImageAlt([a, b], one, a, "  ")).toBeNull()
  })

  it("drops descriptions of removed photos on the next edit", () => {
    const both = [
      { src: a, alt: "A" },
      { src: b, alt: "B" },
    ]
    expect(withImageAlt([b], both, b, "B2")).toEqual([{ src: b, alt: "B2" }])
  })
})
