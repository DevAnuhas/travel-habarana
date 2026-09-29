import { siteConfig } from "@/config/site"

const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ").trim()

/** Shorten copy for meta descriptions without ending mid-word. */
export function truncateAtWord(text: string, max = 160): string {
  const clean = collapseWhitespace(text)
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  // Only back up to a space if that keeps most of the text; otherwise hard-cut.
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut
  return `${base.replace(/[\s,;:.\-–]+$/, "")}…`
}

export function buildPackageTitle(name: string): string {
  return `${collapseWhitespace(name)} | ${siteConfig.name}`
}
