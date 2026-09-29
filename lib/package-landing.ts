import type { ItineraryStep, PackageFaq } from "@/lib/package-serialize"

export function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function formatLines(items?: readonly string[] | null): string {
  return (items ?? []).join("\n")
}

/** One step per line: `time | title | detail`. Time and detail are optional. */
export function parseItinerary(text: string): ItineraryStep[] {
  return parseLines(text).map((line) => {
    const [first = "", second = "", ...rest] = line
      .split("|")
      .map((part) => part.trim())
    if (!second) return { title: first }
    const detail = rest.join(" | ").trim()
    return {
      ...(first ? { time: first } : {}),
      title: second,
      ...(detail ? { detail } : {}),
    }
  })
}

/** Accepts form values too, where time/detail may be null (Zod `.nullable()`). */
type StepInput = {
  time?: string | null
  title: string
  detail?: string | null
}

export function formatItinerary(steps?: readonly StepInput[] | null): string {
  return (steps ?? [])
    .map(({ time, title, detail }) =>
      !time && !detail
        ? title
        : [time ?? "", title, ...(detail ? [detail] : [])].join(" | ")
    )
    .join("\n")
}

/** Blocks separated by a blank line: first line is the question, the rest the answer. */
export function parseFaqs(text: string): {
  faqs: PackageFaq[]
  dropped: number
} {
  const faqs: PackageFaq[] = []
  let dropped = 0
  for (const block of text.split(/\r?\n\s*\r?\n/)) {
    const [question, ...answerLines] = parseLines(block)
    if (!question) continue
    const answer = answerLines.join(" ").trim()
    if (answer) faqs.push({ question, answer })
    else dropped += 1
  }
  return { faqs, dropped }
}

export function formatFaqs(faqs?: readonly PackageFaq[] | null): string {
  return (faqs ?? [])
    .map((faq) => `${faq.question}\n${faq.answer}`)
    .join("\n\n")
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}
