#!/usr/bin/env node
// Real-browser layout checks for conversion surfaces.
//   node scripts/verify-layout.mjs http://localhost:3000 "/:facts" "/packages/x:facts" /contact
// ":facts" also asserts trust, duration and price (and every quick-pick row)
// in the first phone viewport. Exits 1 on any failure.
// No dependencies: Chrome DevTools Protocol over Node's global WebSocket/fetch.
// CHROME_PATH overrides the Chrome binary.
import { spawn } from "node:child_process"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const [base, ...targets] = process.argv.slice(2)
if (!base || targets.length === 0) {
  console.error("usage: verify-layout.mjs <baseUrl> <path[:facts]>...")
  process.exit(2)
}

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 800, height: 1100, mobile: true },
  { name: "laptop", width: 1024, height: 768, mobile: false }, // navbar breakpoint edge
  { name: "desktop", width: 1280, height: 800, mobile: false },
]

const port = 9300 + Math.floor(Math.random() * 500)
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--no-first-run",
    "--disable-gpu",
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "vl-"))}`,
    "about:blank",
  ],
  { stdio: "ignore" }
)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function pageSocketUrl() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const list = await (
        await fetch(`http://127.0.0.1:${port}/json/list`)
      ).json()
      const page = list.find((target) => target.type === "page")
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error("Chrome did not start")
}

const ws = new WebSocket(await pageSocketUrl())
await new Promise((resolve) =>
  ws.addEventListener("open", resolve, { once: true })
)
let nextId = 0
const pending = new Map()
const listeners = new Set()
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  } else for (const listener of listeners) listener(message)
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
const evaluate = async (expression) =>
  (
    await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
  ).result.value

await send("Page.enable")
await send("Network.enable")

async function load(url, viewport) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 2,
    mobile: viewport.mobile,
  })
  const images = []
  const onRequest = (m) =>
    m.method === "Network.requestWillBeSent" &&
    m.params.type === "Image" &&
    images.push(m.params.request.url)
  listeners.add(onRequest)
  const loaded = new Promise((resolve) => {
    const onLoad = (m) =>
      m.method === "Page.loadEventFired" &&
      (listeners.delete(onLoad), resolve())
    listeners.add(onLoad)
  })
  await send("Page.navigate", { url })
  await loaded
  await sleep(1500)
  listeners.delete(onRequest)
  return images
}

// Visible = on screen AND not covered (hit-test at the element's centre).
// Scrolls use behavior: "instant": the site sets scroll-behavior: smooth, and an
// animating scroll would be measured mid-flight.
const IN_PAGE = String.raw`
  const shown = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height || r.bottom <= 0 || r.top >= innerHeight) return false
    const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, r.top + r.height / 2))
    return hit === el || el.contains(hit) || !!hit?.contains(el)
  }
  const anyShown = (selector) => [...document.querySelectorAll(selector)].some(shown)
`

const firstViewport = () =>
  evaluate(`(() => { ${IN_PAGE} scrollTo({ top: 0, behavior: "instant" }); return {
    h1: anyShown("h1"),
    trust: anyShown("[data-trust]"),
    whatsapp: anyShown('a[href^="https://wa.me/"]'),
    duration: anyShown("[data-fact=duration]"),
    price: anyShown("[data-price]"),
    // Every homepage quick-pick row must show its own name, duration and price.
    quickPicks: [...document.querySelectorAll("[data-quick-pick]")].map((row, index) => ({
      index,
      name: shown(row.querySelector("[data-qp-name]")),
      duration: shown(row.querySelector("[data-fact=duration]")),
      price: shown(row.querySelector("[data-price]")),
    })),
    overflowX: document.documentElement.scrollWidth - innerWidth,
  } })()`)

const endOfPage = () =>
  evaluate(`(async () => { ${IN_PAGE}
    // Layout can keep growing after a font-size change (reflow, lazy images), so
    // scroll until we are really at the bottom instead of trusting one jump.
    for (let i = 0; i < 20; i++) {
      scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })
      await new Promise((r) => setTimeout(r, 150))
      if (scrollY >= document.documentElement.scrollHeight - innerHeight - 1) break
    }
    const links = document.querySelectorAll("footer a")
    const bar = document.querySelector("[data-contact-bar]")
    const footer = document.querySelector("footer")
    const before = bar?.previousElementSibling
    const barShown = !!bar && getComputedStyle(bar).display !== "none"
    return {
      lastFooterLinkShown: shown(links[links.length - 1]),
      barAboveFooter: !barShown || !footer || bar.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1,
      contentAboveBar: !barShown || !before || before.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top + 1,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    } })()`)

const selectedPackage = () =>
  evaluate(
    `document.querySelector("[data-slot=select-trigger]")?.textContent?.trim() ?? null`
  )

// Expected and control names come from the public package API, not from the page under test.
async function packageNames(id) {
  const one = await (await fetch(new URL(`/api/packages/${id}`, base))).json()
  const expected = one?.name?.trim() ?? null
  const all = await (await fetch(new URL("/api/packages", base))).json()
  const other =
    (Array.isArray(all) ? all : [])
      .map((p) => p.name?.trim())
      .find((name) => name && name !== expected) ?? null
  return { expected, other }
}

const failures = []
const check = (label, ok, detail) => {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${detail !== undefined ? `  ${JSON.stringify(detail)}` : ""}`
  )
  if (!ok) failures.push(label)
}

for (const target of targets) {
  const [path, flags = ""] = target.split(/:(?=facts$)/)
  const wantFacts = flags === "facts"
  for (const viewport of VIEWPORTS) {
    const images = await load(new URL(path, base).toString(), viewport)
    const tag = `${path} @${viewport.name}`
    const first = await firstViewport()
    check(
      `${tag} no horizontal overflow`,
      first.overflowX <= 0,
      first.overflowX
    )
    check(`${tag} WhatsApp reachable`, first.whatsapp)
    if (viewport.name === "phone") {
      check(`${tag} H1 in first viewport`, first.h1)
      if (wantFacts) {
        check(`${tag} trust in first viewport`, first.trust)
        check(`${tag} duration in first viewport`, first.duration)
        check(`${tag} price in first viewport`, first.price)
        for (const row of first.quickPicks) {
          check(
            `${tag} quick-pick row ${row.index}: name, duration, price in first viewport`,
            row.name && row.duration && row.price,
            row
          )
        }
      }
      const lead = await evaluate(
        `document.querySelector("[data-lead-image] img, img[data-lead-image]")?.currentSrc ?? null`
      )
      if (!lead)
        console.log(
          `INFO  ${tag} no lead image on this page (nothing to count)`
        )
      if (lead) {
        const leadKey = decodeURIComponent(
          new URL(lead).searchParams.get("url") ?? lead
        )
        const hits = images.filter((u) =>
          decodeURIComponent(u).includes(leadKey)
        ).length
        check(`${tag} lead image requested once`, hits === 1, {
          hits,
          totalImageRequests: images.length,
        })
      }
      if (path.startsWith("/book-now?packageId=")) {
        const id = new URL(path, base).searchParams.get("packageId")
        const { expected, other } = await packageNames(id)
        const selected = await selectedPackage()
        check(
          `${tag} requested package is preselected`,
          !!expected && selected === expected,
          { selected, expected }
        )
        // Negative control: the same comparison must reject a different package's name.
        check(
          `${tag} preselection check discriminates`,
          !!other && selected !== other,
          { selected, other }
        )
      }
    }
    for (const zoom of ["100%", "125%"]) {
      await evaluate(`document.documentElement.style.fontSize = "${zoom}"`)
      const end = await endOfPage()
      check(
        `${tag} text ${zoom}: footer's last link not covered`,
        end.lastFooterLinkShown
      )
      check(`${tag} text ${zoom}: bar sits above footer`, end.barAboveFooter)
      check(`${tag} text ${zoom}: content above bar`, end.contentAboveBar)
      check(
        `${tag} text ${zoom}: no horizontal overflow`,
        end.overflowX <= 0,
        end.overflowX
      )
    }
    await evaluate(`document.documentElement.style.fontSize = ""`)
  }
}

ws.close()
chrome.kill()
console.log(
  failures.length
    ? `\n${failures.length} check(s) failed`
    : "\nall checks passed"
)
process.exit(failures.length ? 1 : 0)
