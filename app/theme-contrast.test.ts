import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const css = readFileSync(
  fileURLToPath(new URL("./globals.css", import.meta.url)),
  "utf8"
)

function token(
  block: ":root" | ".dark",
  name: string
): [number, number, number] {
  const body =
    css.match(
      new RegExp(`^${block.replace(".", "\\.")}\\s*\\{([^}]*)\\}`, "m")
    )?.[1] ?? ""
  const match = body.match(
    new RegExp(`--${name}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`)
  )
  if (!match) throw new Error(`token --${name} not found in ${block}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/** OKLCH → linear-light sRGB relative luminance (WCAG 2.x). */
function luminance([L, C, h]: [number, number, number]): number {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  const r = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  const g = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}

const ratio = (x: number, y: number) =>
  (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)

describe("WhatsApp button text contrast (WCAG AA, 4.5:1)", () => {
  it.each([":root", ".dark"] as const)("%s", (block) => {
    const text = luminance(token(block, "whatsapp-foreground"))
    expect(
      ratio(text, luminance(token(block, "whatsapp")))
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      ratio(text, luminance(token(block, "whatsapp-hover")))
    ).toBeGreaterThanOrEqual(4.5)
  })
})

it("the conversion function matches a known value (white on WhatsApp brand green fails)", () => {
  // #25D366 ≈ oklch(0.77 0.19 150): 1.98:1 with white, so it must stay below AA.
  expect(
    ratio(luminance([0.99, 0, 0]), luminance([0.77, 0.19, 150]))
  ).toBeLessThan(2.5)
})
