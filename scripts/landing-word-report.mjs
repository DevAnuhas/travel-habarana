#!/usr/bin/env node
// Words per safari page that sit in sentences appearing on no other package page.
// Advisory: prints GATE OPEN until every safari page has >= 500 such words.
//   node scripts/landing-word-report.mjs http://localhost:3000
const base = process.argv[2] ?? "http://localhost:3000"
const MIN_WORDS = 500

const listing = await (await fetch(new URL("/packages", base))).text()
const slugs = [
  ...new Set(
    [...listing.matchAll(/href="\/packages\/([a-z0-9-]+)"/g)].map((m) => m[1])
  ),
]

const mainText = (html) =>
  (html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "")
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
const sentences = (text) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.split(" ").length >= 4)

const pages = {}
for (const slug of slugs) {
  const html = await (await fetch(new URL(`/packages/${slug}`, base))).text()
  pages[slug] = sentences(mainText(html))
}

let open = false
for (const slug of slugs.filter((s) => /safari/.test(s))) {
  const others = new Set(
    slugs.filter((s) => s !== slug).flatMap((s) => pages[s])
  )
  const words = pages[slug]
    .filter((sentence) => !others.has(sentence))
    .reduce((total, sentence) => total + sentence.split(" ").length, 0)
  if (words < MIN_WORDS) open = true
  console.log(
    `${words >= MIN_WORDS ? "OK  " : "OPEN"}  ${slug}: ${words} unique words`
  )
}
console.log(
  open
    ? `\nGATE OPEN: needs owner content (>= ${MIN_WORDS} unique words per safari page)`
    : "\nGATE MET"
)
