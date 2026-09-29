# Landing Page Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage and every package page into conversion-first landing pages. Each first screen answers what, how long, how much and why trust, and puts one-tap WhatsApp contact within reach on every phone screen.

**Architecture:** Optional structured "landing" fields on the Mongo `Package` feed one server-rendered template. The template renders a section only when its data exists. All behaviour lives in pure modules under `lib/` with Vitest suites. Server components get `renderToStaticMarkup` tests that pin omission rules and markup validity. The existing brand tokens are extended, not replaced.

**Tech Stack:** Next.js 16 App Router (Cache Components), React 19, TypeScript 6, Tailwind 4, shadcn/Radix, Mongoose 9, Zod 4, react-hook-form, Vitest 5 (oxc transform), pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-29-landing-page-revamp-design.md`

**Prerequisite:** `docs/superpowers/plans/2026-09-29-lead-recovery-fixes.md` Tasks 1–7 are complete. This plan consumes:
- `planSlugChange` / `previousSlugs`;
- `PACKAGE_CATEGORIES`, `PRICE_*`, `sortPackages`, `selectRelatedPackages`;
- `truncateAtWord`, `buildPackageTitle`;
- `getFaqs` / `FAQSection variant`;
- `contentRedirects`.

That plan's Tasks 8–11 are **superseded** by this plan, and analytics is dropped.

## Global Constraints

- Formatting: `.prettierrc` (no semicolons, double quotes, 2 spaces). Tab-indented legacy files keep their style.
- One commit per task, with a direct message and **no AI attribution trailer**.
- **No analytics or tracking code of any kind** (PostHog is pending client approval). No `data-umami-*`, no event helpers.
- No new runtime dependencies. Dev dependencies: none beyond Vitest.
- Brand stays: logo files, `--primary` jeep green, `--secondary` dry grass, DM Serif Display (H1/H2) and Inter (everything else), `--radius: 0.25rem`.
- WhatsApp number `+94 76 667 5883` (`siteConfig.contact.phoneE164`). Canonical origin `https://www.ceylonsafari.com`.
- Never invent facts. Price, cancellation, times, season and pickup render only from admin data. The single existing claim reused in static copy is hotel pickup from Habarana, Sigiriya and Dambulla, which is already in the live FAQ.
- Every section must be complete in server HTML: no `opacity:0` mounts and no `<a>` wrapping `<button>`.
- Never write to production data. Local verification uses `travelHabaranaDB-Dev` via `.env.local`.

## Review Focus

1. **A package with no landing data**, which describes every live package today, must render as a complete page with no empty headings. Pinned by the omission tests in Tasks 8 and 9.
2. **Admin editing a list textarea.** Typing a newline must not be eaten mid-edit, and clearing a textarea must save `null`. Pinned in Task 2 (parse tests) with the manual step in Task 2.
3. **Season data with bad months** (0, 13, duplicates, peak/good overlap) from legacy or hand-edited records must be rejected on save and ignored on render. Pinned in Tasks 1 and 5.
4. **The mobile contact bar covering content** (footer links, the last FAQ). Its spacer is pinned in Task 6, with the screenshot check in Task 12.
5. **Long or odd package names** (`&`, quotes, trailing spaces) in WhatsApp prefill, titles and aria labels. Pinned in Tasks 3 and 8.

---

### Task 1: Landing content fields on the package

**Files:**
- Create: `lib/package-serialize.ts`, `lib/package-serialize.test.ts`
- Modify: `lib/types.ts` (`packageSchema`), `lib/types.test.ts`, `models/Package.ts`, `lib/packages.ts`

**Interfaces:**
- Consumes: Task 3 of the lead-recovery plan (merchandising fields, `superRefine` on `packageSchema`).
- Produces:
  - `interface ItineraryStep { time?: string; title: string; detail?: string }`
  - `interface PackageFaq { question: string; answer: string }`
  - `interface Season { peak: number[]; good: number[] }`
  - `PublicPackage` gains `summary?`, `seoTitle?`, `seoDescription?`, `groupSize?`, `highlights?`, `notIncluded?`, `timeSlots?`, `pickupAreas?`, `whatToBring?`, `itinerary?`, `faqs?`, `season?`. Each is `undefined` when unset or empty.
  - `serializePackage(doc: PackageDocument): PublicPackage`, exported from the pure module `lib/package-serialize.ts`. `lib/packages.ts` re-exports `PublicPackage`.

- [ ] **Step 1: Failing schema tests.** Append to `lib/types.test.ts`:

```ts
describe("packageSchema landing fields", () => {
  const landing = {
    summary: "See the elephant gathering at Minneriya tank in a private jeep.",
    seoTitle: "Minneriya National Park Jeep Safari from Habarana",
    seoDescription: "Private Minneriya jeep safari with hotel pickup.",
    groupSize: "Up to 6 per jeep",
    highlights: ["Elephant herds at the tank"],
    notIncluded: ["Park entrance tickets"],
    timeSlots: ["6:00 am", "2:30 pm"],
    pickupAreas: ["Habarana", "Sigiriya"],
    whatToBring: ["Hat"],
    itinerary: [{ time: "2:30 pm", title: "Hotel pickup", detail: "In an open jeep" }],
    faqs: [{ question: "Is it private?", answer: "Yes, the jeep is only for your group." }],
    season: { peak: [8, 9], good: [7, 10] },
  }

  it("accepts a full landing payload", () => {
    expect(packageSchema.safeParse({ ...legacyPackage, ...landing }).success).toBe(true)
  })

  it("accepts null for every landing field", () => {
    const nulls = Object.fromEntries(Object.keys(landing).map((key) => [key, null]))
    expect(packageSchema.safeParse({ ...legacyPackage, ...nulls }).success).toBe(true)
  })

  it.each([
    ["too many highlights", { highlights: Array.from({ length: 9 }, (_, i) => `H${i}`) }],
    ["month 13", { season: { peak: [13], good: [] } }],
    ["month 0", { season: { peak: [], good: [0] } }],
    ["duplicate month", { season: { peak: [8, 8], good: [] } }],
    ["peak and good overlap", { season: { peak: [8], good: [8] } }],
    ["FAQ without answer", { faqs: [{ question: "Is it private?", answer: "" }] }],
    ["summary over 220 chars", { summary: "a".repeat(221) }],
  ])("rejects %s", (_label, extra) => {
    expect(packageSchema.safeParse({ ...legacyPackage, ...extra }).success).toBe(false)
  })
})
```

Run: `pnpm test lib/types.test.ts`
Expected: FAIL on every "rejects" case except "FAQ without answer". Unknown keys are stripped, so they parse.

- [ ] **Step 2: Implement the schema.** In `lib/types.ts` add above `packageSchema`:

```ts
const optionalText = (maximum: number) =>
	z.string().trim().max(maximum).nullable().optional();

const listOf = (maxItems: number, maxLength: number, label: string) =>
	z.array(trimmedString(1, maxLength, label)).max(maxItems).nullable().optional();

const monthSchema = z.number().int().min(1).max(12);
```

add these keys inside the `packageSchema` object:

```ts
	summary: optionalText(220),
	seoTitle: optionalText(70),
	seoDescription: optionalText(160),
	groupSize: optionalText(60),
	highlights: listOf(8, 140, "Highlight"),
	notIncluded: listOf(12, 140, "Not included item"),
	timeSlots: listOf(4, 40, "Time slot"),
	pickupAreas: listOf(10, 60, "Pickup area"),
	whatToBring: listOf(10, 100, "What to bring item"),
	itinerary: z
		.array(
			z.object({
				time: optionalText(20),
				title: trimmedString(1, 100, "Itinerary step"),
				detail: optionalText(300),
			})
		)
		.max(10)
		.nullable()
		.optional(),
	faqs: z
		.array(
			z.object({
				question: trimmedString(5, 200, "Question"),
				answer: trimmedString(5, 1_000, "Answer"),
			})
		)
		.max(10)
		.nullable()
		.optional(),
	season: z
		.object({ peak: z.array(monthSchema).max(12), good: z.array(monthSchema).max(12) })
		.nullable()
		.optional(),
```

and extend the existing `superRefine` body with:

```ts
	if (value.season) {
		const all = [...value.season.peak, ...value.season.good];
		if (new Set(all).size !== all.length) {
			context.addIssue({
				code: "custom",
				path: ["season"],
				message: "Each month can be marked once, as peak or good",
			});
		}
	}
```

Run: `pnpm test lib/types.test.ts`
Expected: PASS.

- [ ] **Step 3: Failing serializer tests.** Create `lib/package-serialize.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { serializePackage, type PackageDocument } from "./package-serialize"

const base: PackageDocument = {
  _id: "a".repeat(24),
  slug: "hurulu-eco-park-safari",
  name: "Hurulu Eco Park Safari ",
  description: "A private jeep safari.",
  duration: "3 hours",
  included: ["Private jeep"],
  images: ["https://res.cloudinary.com/demo/hurulu.jpg"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
}

describe("serializePackage", () => {
  it("keeps a legacy package intact and trims the name", () => {
    const result = serializePackage(base)
    expect(result).toMatchObject({
      _id: "a".repeat(24),
      slug: "hurulu-eco-park-safari",
      name: "Hurulu Eco Park Safari",
      images: ["https://res.cloudinary.com/demo/hurulu.jpg"],
      createdAt: "2026-01-01T00:00:00.000Z",
    })
    expect(result.summary).toBeUndefined()
    expect(result.season).toBeUndefined()
  })

  it("maps null, blank strings and empty lists to undefined", () => {
    const result = serializePackage({
      ...base,
      summary: "  ",
      highlights: [],
      faqs: null,
      season: { peak: [], good: [] },
      priceFrom: null,
    })
    expect(result.summary).toBeUndefined()
    expect(result.highlights).toBeUndefined()
    expect(result.faqs).toBeUndefined()
    expect(result.season).toBeUndefined()
    expect(result.priceFrom).toBeUndefined()
  })

  it("passes landing data through as plain values", () => {
    const result = serializePackage({
      ...base,
      summary: " Elephants at the tank. ",
      itinerary: [{ time: null, title: "Pickup", detail: null }],
      season: { peak: [8], good: [7] },
    })
    expect(result.summary).toBe("Elephants at the tank.")
    expect(result.itinerary).toEqual([{ title: "Pickup" }])
    expect(result.season).toEqual({ peak: [8], good: [7] })
  })
})
```

Run: `pnpm test lib/package-serialize.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement the serializer.** Create `lib/package-serialize.ts`. Move `PublicPackage`, `PackageDocument` and `serializePackage` here from `lib/packages.ts`, with no `server-only` import, and extend them:

```ts
import type {
  PackageCategory,
  PriceCurrency,
  PriceUnit,
} from "@/lib/package-catalog"

export interface ItineraryStep {
  time?: string
  title: string
  detail?: string
}

export interface PackageFaq {
  question: string
  answer: string
}

export interface Season {
  peak: number[]
  good: number[]
}

export interface PublicPackage {
  _id: string
  slug: string
  name: string
  description: string
  duration: string
  included: string[]
  images: string[]
  createdAt?: string
  updatedAt?: string
  category?: PackageCategory
  sortOrder?: number
  priceFrom?: number
  priceCurrency?: PriceCurrency
  priceUnit?: PriceUnit
  priceNote?: string
  summary?: string
  seoTitle?: string
  seoDescription?: string
  groupSize?: string
  highlights?: string[]
  notIncluded?: string[]
  timeSlots?: string[]
  pickupAreas?: string[]
  whatToBring?: string[]
  itinerary?: ItineraryStep[]
  faqs?: PackageFaq[]
  season?: Season
}

type Nullable<T> = { [K in keyof T]?: T[K] | null }

export interface PackageDocument
  extends Nullable<
    Omit<
      PublicPackage,
      "_id" | "createdAt" | "updatedAt" | "itinerary" | "season"
    >
  > {
  _id: { toString(): string } | string
  slug: string
  name: string
  description: string
  duration: string
  included: string[]
  images?: string[] | null
  createdAt?: Date | null
  updatedAt?: Date | null
  itinerary?: Array<{
    time?: string | null
    title: string
    detail?: string | null
  }> | null
  season?: { peak?: number[] | null; good?: number[] | null } | null
}

const text = (value?: string | null) => value?.trim() || undefined
const list = <T>(value?: T[] | null) =>
  value && value.length > 0 ? value : undefined

export function serializePackage(doc: PackageDocument): PublicPackage {
  const itinerary = list(doc.itinerary)?.map((step) => ({
    title: step.title.trim(),
    ...(text(step.time) ? { time: text(step.time) } : {}),
    ...(text(step.detail) ? { detail: text(step.detail) } : {}),
  }))
  const peak = doc.season?.peak ?? []
  const good = doc.season?.good ?? []

  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name.trim(),
    description: doc.description,
    duration: doc.duration,
    included: doc.included,
    images: doc.images ?? [],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
    category: doc.category ?? undefined,
    sortOrder: doc.sortOrder ?? undefined,
    priceFrom: doc.priceFrom ?? undefined,
    priceCurrency: doc.priceCurrency ?? undefined,
    priceUnit: doc.priceUnit ?? undefined,
    priceNote: text(doc.priceNote),
    summary: text(doc.summary),
    seoTitle: text(doc.seoTitle),
    seoDescription: text(doc.seoDescription),
    groupSize: text(doc.groupSize),
    highlights: list(doc.highlights),
    notIncluded: list(doc.notIncluded),
    timeSlots: list(doc.timeSlots),
    pickupAreas: list(doc.pickupAreas),
    whatToBring: list(doc.whatToBring),
    itinerary,
    faqs: list(doc.faqs),
    season:
      peak.length > 0 || good.length > 0
        ? { peak: [...peak], good: [...good] }
        : undefined,
  }
}
```

`lib/packages.ts`: delete the moved interfaces and function, then add

```ts
import { serializePackage, type PackageDocument } from "@/lib/package-serialize";
export type { PublicPackage } from "@/lib/package-serialize";
```

and keep `getPackages` / `getPackage` casting `.lean()` results to `PackageDocument`.

`models/Package.ts`: add

```ts
		summary: { type: String, default: null },
		seoTitle: { type: String, default: null },
		seoDescription: { type: String, default: null },
		groupSize: { type: String, default: null },
		highlights: { type: [String], default: undefined },
		notIncluded: { type: [String], default: undefined },
		timeSlots: { type: [String], default: undefined },
		pickupAreas: { type: [String], default: undefined },
		whatToBring: { type: [String], default: undefined },
		itinerary: {
			type: [new mongoose.Schema({ time: String, title: { type: String, required: true }, detail: String }, { _id: false })],
			default: undefined,
		},
		faqs: {
			type: [new mongoose.Schema({ question: { type: String, required: true }, answer: { type: String, required: true } }, { _id: false })],
			default: undefined,
		},
		season: {
			type: new mongoose.Schema({ peak: [Number], good: [Number] }, { _id: false }),
			default: null,
		},
```

- [ ] **Step 5: Verify and commit.**

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

```bash
git add lib/package-serialize.ts lib/package-serialize.test.ts lib/types.ts lib/types.test.ts models/Package.ts lib/packages.ts
git commit -m "feat: add optional landing-page content fields to packages"
```

---

### Task 2: Admin editing for landing content

**Files:**
- Create: `lib/package-landing.ts`, `lib/package-landing.test.ts`
- Create: `lib/season.ts`, `lib/season.test.ts`
- Create: `components/admin/lines-textarea.tsx`, `components/admin/season-picker.tsx`, `components/admin/package-landing-fields.tsx`
- Modify: `app/admin/(dashboard)/packages/page.tsx`

**Interfaces:**
- Produces:
  - `parseLines(text: string): string[]`, `formatLines(items?: readonly string[] | null): string`
  - `parseItinerary(text: string): ItineraryStep[]`, `formatItinerary(steps?: readonly ItineraryStep[] | null): string`
  - `parseFaqs(text: string): { faqs: PackageFaq[]; dropped: number }`, `formatFaqs(faqs?: readonly PackageFaq[] | null): string`
  - `splitParagraphs(text: string): string[]`
  - `MONTH_LABELS: readonly string[]` (12), `MONTH_INITIALS: readonly string[]` (12)
  - `type SeasonLevel = "peak" | "good" | "off"`, `SeasonCell = { month: number; label: string; initial: string; level: SeasonLevel }`
  - `buildSeasonCells(season?: Season | null): SeasonCell[] | null`, `cycleMonth(season: Season | null | undefined, month: number): Season | null`, `describeSeason(season?: Season | null): string | null`

- [ ] **Step 1: Failing tests.** Create `lib/package-landing.test.ts`:

```ts
import { describe, expect, it } from "vitest"

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
    expect(parseLines(" Hat \n\n   \nSunscreen\r\n")).toEqual(["Hat", "Sunscreen"])
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
    expect(parseItinerary("Enter the park")).toEqual([{ title: "Enter the park" }])
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
    const result = parseFaqs("Is it private?\nYes, only your group.\n\nDo you pick up?\nYes, from Habarana.\nAnd Sigiriya.")
    expect(result).toEqual({
      faqs: [
        { question: "Is it private?", answer: "Yes, only your group." },
        { question: "Do you pick up?", answer: "Yes, from Habarana. And Sigiriya." },
      ],
      dropped: 0,
    })
  })

  it("drops and counts blocks with no answer", () => {
    expect(parseFaqs("Lonely question?\n\nQ?\nA.")).toEqual({
      faqs: [{ question: "Q?", answer: "A." }],
      dropped: 1,
    })
  })

  it("round-trips through formatFaqs", () => {
    const faqs = [{ question: "Q one?", answer: "A one." }, { question: "Q two?", answer: "A two." }]
    expect(parseFaqs(formatFaqs(faqs)).faqs).toEqual(faqs)
  })
})

it("splitParagraphs splits on blank lines and collapses inner whitespace", () => {
  expect(splitParagraphs("One\nline.\n\n\nTwo  here.\n")).toEqual(["One line.", "Two here."])
})
```

Create `lib/season.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildSeasonCells, cycleMonth, describeSeason } from "./season"

describe("buildSeasonCells", () => {
  it("returns null when there is no season data", () => {
    expect(buildSeasonCells(undefined)).toBeNull()
    expect(buildSeasonCells({ peak: [], good: [] })).toBeNull()
  })

  it("marks 12 months with peak winning over good", () => {
    const cells = buildSeasonCells({ peak: [8, 9], good: [7, 10] })!
    expect(cells).toHaveLength(12)
    expect(cells.map((c) => c.level).join(",")).toBe(
      "off,off,off,off,off,off,good,peak,peak,good,off,off"
    )
    expect(cells[0]).toMatchObject({ month: 1, label: "Jan", initial: "J" })
  })

  it("ignores invalid months from legacy data", () => {
    const cells = buildSeasonCells({ peak: [0, 13, 8.5, 8], good: [] })!
    expect(cells.filter((c) => c.level !== "off").map((c) => c.month)).toEqual([8])
  })
})

describe("cycleMonth", () => {
  it("cycles off → good → peak → off", () => {
    const once = cycleMonth(null, 8)
    expect(once).toEqual({ peak: [], good: [8] })
    const twice = cycleMonth(once, 8)
    expect(twice).toEqual({ peak: [8], good: [] })
    expect(cycleMonth(twice, 8)).toBeNull()
  })

  it("keeps months sorted", () => {
    expect(cycleMonth({ peak: [], good: [9] }, 7)).toEqual({ peak: [], good: [7, 9] })
  })
})

describe("describeSeason", () => {
  it("summarises runs of months for screen readers and captions", () => {
    expect(describeSeason({ peak: [7, 8, 9], good: [6, 10, 12] })).toBe(
      "Best: Jul–Sep. Good: Jun, Oct, Dec."
    )
  })

  it("returns null without data", () => {
    expect(describeSeason(undefined)).toBeNull()
  })
})
```

Run: `pnpm test lib/package-landing.test.ts lib/season.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 2: Implement.** Create `lib/package-landing.ts`:

```ts
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
    const [first = "", second = "", ...rest] = line.split("|").map((part) => part.trim())
    if (!second) return { title: first }
    const detail = rest.join(" | ").trim()
    return {
      ...(first ? { time: first } : {}),
      title: second,
      ...(detail ? { detail } : {}),
    }
  })
}

export function formatItinerary(steps?: readonly ItineraryStep[] | null): string {
  return (steps ?? [])
    .map(({ time, title, detail }) => {
      if (!time && !detail) return title
      return [time ?? "", title, ...(detail ? [detail] : [])].join(" | ")
    })
    .join("\n")
}

/** Blocks separated by a blank line: first line is the question, the rest the answer. */
export function parseFaqs(text: string): { faqs: PackageFaq[]; dropped: number } {
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
  return (faqs ?? []).map((faq) => `${faq.question}\n${faq.answer}`).join("\n\n")
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}
```

Create `lib/season.ts`:

```ts
import type { Season } from "@/lib/package-serialize"

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const
export const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const

export type SeasonLevel = "peak" | "good" | "off"

export interface SeasonCell {
  month: number
  label: string
  initial: string
  level: SeasonLevel
}

const isMonth = (value: number) => Number.isInteger(value) && value >= 1 && value <= 12

function normalise(season?: Season | null) {
  const peak = new Set((season?.peak ?? []).filter(isMonth))
  const good = new Set((season?.good ?? []).filter((m) => isMonth(m) && !peak.has(m)))
  return { peak, good }
}

export function buildSeasonCells(season?: Season | null): SeasonCell[] | null {
  const { peak, good } = normalise(season)
  if (peak.size === 0 && good.size === 0) return null
  return MONTH_LABELS.map((label, index) => {
    const month = index + 1
    return {
      month,
      label,
      initial: MONTH_INITIALS[index],
      level: peak.has(month) ? "peak" : good.has(month) ? "good" : "off",
    }
  })
}

/** Admin picker: off → good → peak → off. Returns null when nothing is marked. */
export function cycleMonth(season: Season | null | undefined, month: number): Season | null {
  const { peak, good } = normalise(season)
  if (peak.has(month)) peak.delete(month)
  else if (good.has(month)) {
    good.delete(month)
    peak.add(month)
  } else good.add(month)
  if (peak.size === 0 && good.size === 0) return null
  const sorted = (set: Set<number>) => [...set].sort((a, b) => a - b)
  return { peak: sorted(peak), good: sorted(good) }
}

function describeRuns(months: number[]): string {
  const runs: string[] = []
  let start = months[0]
  for (let i = 1; i <= months.length; i++) {
    if (months[i] !== months[i - 1] + 1) {
      const end = months[i - 1]
      runs.push(start === end ? MONTH_LABELS[start - 1] : `${MONTH_LABELS[start - 1]}–${MONTH_LABELS[end - 1]}`)
      start = months[i]
    }
  }
  return runs.join(", ")
}

export function describeSeason(season?: Season | null): string | null {
  const { peak, good } = normalise(season)
  const parts: string[] = []
  if (peak.size) parts.push(`Best: ${describeRuns([...peak].sort((a, b) => a - b))}.`)
  if (good.size) parts.push(`Good: ${describeRuns([...good].sort((a, b) => a - b))}.`)
  return parts.length ? parts.join(" ") : null
}
```

Run: `pnpm test lib/package-landing.test.ts lib/season.test.ts`
Expected: PASS.

- [ ] **Step 3: Admin components.** Create `components/admin/lines-textarea.tsx`. It keeps the raw text locally, so typing a newline never gets reformatted mid-edit. It pushes the parsed value up on every change, and `null` when empty.

```tsx
"use client"

import { useState } from "react"

import { Textarea } from "@/components/ui/textarea"

interface LinesTextareaProps<T> {
  id: string
  value: T | null | undefined
  format: (value: T | null | undefined) => string
  parse: (text: string) => T
  isEmpty: (value: T) => boolean
  onChange: (value: T | null) => void
  placeholder?: string
  rows?: number
  describedBy?: string
}

export function LinesTextarea<T>({
  id,
  value,
  format,
  parse,
  isEmpty,
  onChange,
  placeholder,
  rows = 4,
  describedBy,
}: LinesTextareaProps<T>) {
  const [text, setText] = useState(() => format(value))

  return (
    <Textarea
      id={id}
      rows={rows}
      value={text}
      placeholder={placeholder}
      aria-describedby={describedBy}
      onChange={(event) => {
        setText(event.target.value)
        const parsed = parse(event.target.value)
        onChange(isEmpty(parsed) ? null : parsed)
      }}
    />
  )
}
```

Create `components/admin/season-picker.tsx`:

```tsx
"use client"

import { buildSeasonCells, cycleMonth, MONTH_LABELS } from "@/lib/season"
import type { Season } from "@/lib/package-serialize"
import { cn } from "@/lib/utils"

const LEVEL_STYLE = {
  off: "border-border bg-background text-muted-foreground",
  good: "border-secondary bg-secondary/40 text-foreground",
  peak: "border-primary bg-primary text-primary-foreground",
} as const

export function SeasonPicker({
  value,
  onChange,
}: {
  value: Season | null | undefined
  onChange: (value: Season | null) => void
}) {
  const cells =
    buildSeasonCells(value) ??
    MONTH_LABELS.map((label, index) => ({ month: index + 1, label, initial: label[0], level: "off" as const }))

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12" role="group" aria-label="Best months">
      {cells.map((cell) => (
        <button
          key={cell.month}
          type="button"
          onClick={() => onChange(cycleMonth(value, cell.month))}
          aria-label={`${cell.label}: ${cell.level === "off" ? "not marked" : cell.level}`}
          className={cn("rounded border px-1 py-2 text-xs font-medium", LEVEL_STYLE[cell.level])}
        >
          {cell.label}
        </button>
      ))}
    </div>
  )
}
```

Create `components/admin/package-landing-fields.tsx`. First export the form type from `lib/types.ts`: `export type PackageInput = z.infer<typeof packageSchema>;`.

```tsx
"use client"

import { useState } from "react"
import type { Control } from "react-hook-form"

import { LinesTextarea } from "@/components/admin/lines-textarea"
import { SeasonPicker } from "@/components/admin/season-picker"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  formatFaqs,
  formatItinerary,
  formatLines,
  parseFaqs,
  parseItinerary,
  parseLines,
} from "@/lib/package-landing"
import type { PackageInput } from "@/lib/types"

type TextKey = "summary" | "seoTitle" | "seoDescription" | "groupSize"
type ListKey = "highlights" | "notIncluded" | "timeSlots" | "pickupAreas" | "whatToBring"

const TEXT_FIELDS: Array<{ name: TextKey; label: string; hint: string; multiline?: boolean; placeholder: string }> = [
  { name: "summary", label: "Summary", hint: "Shown on cards and under the page title. Up to 220 characters.", multiline: true, placeholder: "See the elephant gathering at Minneriya tank in a private jeep with a local guide." },
  { name: "groupSize", label: "Group size", hint: "Shown as a fact chip.", placeholder: "Up to 6 per jeep" },
  { name: "seoTitle", label: "Search title", hint: "Up to 70 characters. The brand is added automatically.", placeholder: "Minneriya National Park Jeep Safari from Habarana" },
  { name: "seoDescription", label: "Search description", hint: "Up to 160 characters. Leave blank to use the summary.", multiline: true, placeholder: "Private Minneriya jeep safari with hotel pickup from Habarana, Sigiriya and Dambulla." },
]

const LIST_FIELDS: Array<{ name: ListKey; label: string; placeholder: string }> = [
  { name: "highlights", label: "Highlights", placeholder: "Herds of wild elephants at the Minneriya tank" },
  { name: "notIncluded", label: "Not included", placeholder: "Park entrance tickets" },
  { name: "timeSlots", label: "Start times", placeholder: "6:00 am" },
  { name: "pickupAreas", label: "Free pickup areas", placeholder: "Habarana" },
  { name: "whatToBring", label: "What to bring", placeholder: "Hat and sunscreen" },
]

export function PackageLandingFields({ control }: { control: Control<PackageInput> }) {
  const [droppedFaqs, setDroppedFaqs] = useState(0)

  return (
    <div className="space-y-5">
      {TEXT_FIELDS.map((config) => (
        <FormField
          key={config.name}
          control={control}
          name={config.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{config.label}</FormLabel>
              <FormControl>
                {config.multiline ? (
                  <Textarea rows={2} placeholder={config.placeholder} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                ) : (
                  <Input placeholder={config.placeholder} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                )}
              </FormControl>
              <FormDescription>{config.hint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      {LIST_FIELDS.map((config) => (
        <FormField
          key={config.name}
          control={control}
          name={config.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`landing-${config.name}`}>{config.label}</FormLabel>
              <LinesTextarea
                id={`landing-${config.name}`}
                value={field.value}
                format={formatLines}
                parse={parseLines}
                isEmpty={(value) => value.length === 0}
                onChange={field.onChange}
                placeholder={config.placeholder}
              />
              <FormDescription>One per line.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={control}
        name="itinerary"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="landing-itinerary">How the day runs</FormLabel>
            <LinesTextarea
              id="landing-itinerary"
              value={field.value ?? undefined}
              format={(steps) => formatItinerary(steps ?? undefined)}
              parse={parseItinerary}
              isEmpty={(steps) => steps.length === 0}
              onChange={field.onChange}
              placeholder={"2:30 pm | Hotel pickup | In an open safari jeep\n3:15 pm | Enter Minneriya National Park"}
              rows={5}
            />
            <FormDescription>One step per line: time | title | detail. Time and detail are optional.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="faqs"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="landing-faqs">Package FAQs</FormLabel>
            <LinesTextarea
              id="landing-faqs"
              value={field.value ?? undefined}
              format={(faqs) => formatFaqs(faqs ?? undefined)}
              parse={(text) => {
                const result = parseFaqs(text)
                setDroppedFaqs(result.dropped)
                return result.faqs
              }}
              isEmpty={(faqs) => faqs.length === 0}
              onChange={field.onChange}
              placeholder={"Is the jeep private?\nYes, the jeep is only for your group.\n\nDo you pick up from Sigiriya?\nYes."}
              rows={6}
            />
            <FormDescription>Question on the first line, answer below it, and a blank line between questions.</FormDescription>
            {droppedFaqs > 0 && (
              <p className="text-sm text-destructive" role="status">
                {droppedFaqs} question{droppedFaqs === 1 ? " has" : "s have"} no answer and won&apos;t be saved.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="season"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Best months</FormLabel>
            <SeasonPicker value={field.value} onChange={field.onChange} />
            <FormDescription>Click a month: good → best → off.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

`useForm` in the admin page switches its generic to `PackageInput` (same type, now shared).

- [ ] **Step 4: Wire the tab.** In `app/admin/(dashboard)/packages/page.tsx`:
1. Add a `<TabsTrigger value="landing">Landing page</TabsTrigger>` after "Included".
2. Render `<PackageLandingFields key={editingPackage?._id ?? "new"} control={form.control} />` when `activeTab === "landing"`. The `key` resets the textareas' local text when switching packages.
3. Extend the local `Package` type, both `form.reset(...)` calls and `defaultValues` with the 12 landing keys (`editingPackage.x ?? null`, or `null` for new).
4. Add them to the `JSON.stringify` body as `x: data.x ?? null`.
5. Make the Included tab's "Next" button go to `landing`, and add Previous/Save on the landing tab, mirroring the existing tab buttons.

- [ ] **Step 5: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

Manual check (`pnpm dev`, dev DB), in `/admin/packages`:
- Edit a package and open "Landing page". Type two highlights on separate lines: the newline is kept while typing.
- Add `2:30 pm | Pickup | Open jeep`, and an FAQ block with no answer: the warning appears.
- Mark Aug as best (two clicks). Save, then reopen: all values persist.
- Clear the highlights, save, reopen: the field is empty.

```bash
git add lib/package-landing.ts lib/package-landing.test.ts lib/season.ts lib/season.test.ts components/admin "app/admin/(dashboard)/packages/page.tsx"
git commit -m "feat: edit landing-page content for packages in the admin"
```

---

### Task 3: Contact primitives, trust line, WhatsApp button variant

**Files:**
- Create: `lib/contact-links.ts`, `lib/contact-links.test.ts`
- Create: `components/common/contact-actions.tsx`, `components/common/contact-actions.test.tsx`
- Create: `components/common/trust-line.tsx`, `components/common/trust-line.test.tsx`
- Create: `config/imagery.ts`
- Modify: `app/globals.css` (tokens and heading scale), `components/ui/button.tsx` (`whatsapp` variant), `config/site.ts` (`reviews`, drop `links.whatsapp`)
- Modify every `siteConfig.links.whatsapp` user: `components/ui/whatsapp-button.tsx`, `components/layout/footer.tsx`, `components/home/hero-section.tsx`, `app/(main)/contact/page.tsx`, `app/(main)/thank-you/page.tsx`

**Interfaces:**
- Produces:
  - `buildWhatsAppUrl(options?: { packageName?: string }): string`, `TEL_HREF: string`
  - `<ContactActions packageName? className? stacked? />`
  - `<TrustLine tone?: "light" | "dark" className? />`
  - `siteConfig.reviews: { rating: number; count: number; source: "Google"; url: string }`
  - `imagery: { hero, guests[], jeeps, cooking }`, each `{ src: string; alt: string }`
  - Tailwind colours `bg-whatsapp`, `text-whatsapp-foreground`, `bg-surface-sunken`

- [ ] **Step 1: Failing tests.** Create `lib/contact-links.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildWhatsAppUrl, TEL_HREF } from "./contact-links"

const messageOf = (url: string) => new URL(url).searchParams.get("text") ?? ""

describe("buildWhatsAppUrl", () => {
  it("targets the business number without a plus sign", () => {
    expect(buildWhatsAppUrl().startsWith("https://wa.me/94766675883?text=")).toBe(true)
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
```

Create `components/common/contact-actions.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ContactActions } from "./contact-actions"

describe("ContactActions", () => {
  const html = renderToStaticMarkup(<ContactActions packageName="Hurulu Eco Park Safari" />)

  it("links WhatsApp with the package prefilled in a new tab", () => {
    expect(html).toContain('href="https://wa.me/94766675883?text=')
    expect(html).toContain(encodeURIComponent("Hurulu Eco Park Safari"))
    expect(html).toContain('target="_blank"')
  })

  it("offers a tel: link that shows the number", () => {
    expect(html).toContain('href="tel:+94766675883"')
    expect(html).toContain("+94 76 667 5883")
  })

  it("never nests a button inside a link", () => {
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<button/s)
  })
})
```

Create `components/common/trust-line.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it } from "vitest"

import { TrustLine } from "./trust-line"

it("shows the Google rating and review count and links to the listing", () => {
  const html = renderToStaticMarkup(<TrustLine />)
  expect(html).toContain("5.0")
  expect(html).toContain("27 Google reviews")
  expect(html).toContain('href="https://maps.app.goo.gl/jtjd3mUANDnH3rRu5"')
})
```

Run: `pnpm test lib/contact-links.test.ts components/common`
Expected: FAIL, modules not found.

- [ ] **Step 2: Implement.** Create `lib/contact-links.ts`:

```ts
import { siteConfig } from "@/config/site"

const WHATSAPP_NUMBER = siteConfig.contact.phoneE164.replace(/^\+/, "")

export const TEL_HREF = `tel:${siteConfig.contact.phoneE164}`

export function buildWhatsAppUrl({ packageName }: { packageName?: string } = {}): string {
  const name = packageName?.trim()
  const subject = name
    ? `I'd like to check availability for "${name}".`
    : "I'd like to ask about a safari."
  const text = [`Hi ${siteConfig.name}! ${subject}`, "Date: ", "People: ", "Pickup hotel: "].join("\n")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
```

`config/site.ts`: delete `links.whatsapp` and add

```ts
  // Google Business Profile rating shown as a trust line. Update it when the
  // count changes; never round it up.
  reviews: {
    rating: 5,
    count: 27,
    source: "Google",
    url: "https://maps.app.goo.gl/jtjd3mUANDnH3rRu5",
  },
```

Create `config/imagery.ts`:

```ts
const cloudinary = (path: string) => `https://res.cloudinary.com/travelhabarana/image/upload/${path}`

export const imagery = {
  hero: {
    src: cloudinary("v1747225669/1_s6q0hr.jpg"),
    alt: "A herd of wild elephants grazing beside the Minneriya tank",
  },
  jeeps: {
    src: cloudinary("v1747225191/cover_yulgqs.jpg"),
    alt: "Safari jeeps on a dirt track inside the national park",
  },
  cooking: {
    src: cloudinary("v1747225593/IMG_0515_fagere.jpg"),
    alt: "Guests learning to cook Sri Lankan dishes in clay pots over a wood fire",
  },
  guests: [
    { src: cloudinary("v1747400857/IMG_8961_ntttrb.jpg"), alt: "Guests smiling in a safari jeep" },
    { src: cloudinary("v1747400887/IMG_0422_g3orcr.jpg"), alt: "A group of guests standing up in an open jeep" },
    { src: cloudinary("v1747400905/IMG_8953_rirwyz.jpg"), alt: "Guests photographing wildlife from the jeep" },
    { src: cloudinary("v1747225191/cover_yulgqs.jpg"), alt: "Jeeps lined up for the evening safari" },
  ],
} as const
```

`app/globals.css`:
- In `@theme inline` add `--color-whatsapp: var(--whatsapp); --color-whatsapp-foreground: var(--whatsapp-foreground); --color-surface-sunken: var(--surface-sunken);`.
- In `:root` add `--whatsapp: oklch(0.72 0.17 150); --whatsapp-foreground: oklch(0.99 0 0); --surface-sunken: oklch(0.935 0.012 100);`.
- In `.dark` add `--whatsapp: oklch(0.7 0.16 150); --whatsapp-foreground: oklch(0.13 0.02 150); --surface-sunken: oklch(0.19 0.03 125);`.
- Replace the `h1`/`h2`/`h3` base rules with:

```css
	h1 {
		@apply font-serif text-4xl leading-tight text-balance md:text-6xl;
	}
	h2 {
		@apply font-serif text-3xl leading-tight text-balance md:text-4xl;
	}
	h3 {
		@apply font-sans text-xl font-semibold md:text-2xl;
	}
```

`components/ui/button.tsx`: add to `variant`

```ts
				whatsapp:
					"bg-whatsapp text-whatsapp-foreground shadow-xs hover:bg-whatsapp/90",
```

Create `components/common/contact-actions.tsx`:

```tsx
import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { buildWhatsAppUrl, TEL_HREF } from "@/lib/contact-links"
import { cn } from "@/lib/utils"

interface ContactActionsProps {
  packageName?: string
  stacked?: boolean
  className?: string
}

export function ContactActions({ packageName, stacked = false, className }: ContactActionsProps) {
  return (
    <div className={cn("flex flex-col gap-3", !stacked && "sm:flex-row", className)}>
      <Button asChild size="lg" variant="whatsapp" className="w-full sm:w-auto">
        <a href={buildWhatsAppUrl({ packageName })} target="_blank" rel="noopener noreferrer">
          <WhatsappLogo weight="fill" className="size-5" aria-hidden="true" />
          Ask on WhatsApp
        </a>
      </Button>
      <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
        <a href={TEL_HREF}>
          <Phone className="size-5" aria-hidden="true" />
          Call {siteConfig.contact.phone}
        </a>
      </Button>
    </div>
  )
}
```

Create `components/common/trust-line.tsx`:

```tsx
import { Star } from "@phosphor-icons/react/dist/ssr"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function TrustLine({ tone = "dark", className }: { tone?: "light" | "dark"; className?: string }) {
  const { rating, count, source, url } = siteConfig.reviews
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline",
        tone === "light" ? "text-white" : "text-foreground",
        className
      )}
    >
      <Star weight="fill" className="size-4 text-secondary" aria-hidden="true" />
      {rating.toFixed(1)} · {count} {source} reviews
    </a>
  )
}
```

Replace each `siteConfig.links.whatsapp` with `buildWhatsAppUrl()`. `pnpm typecheck` lists every remaining use. The contact page's plain phone number becomes `<a href={TEL_HREF}>`.

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

- [ ] **Step 3: Commit.**

```bash
git add lib/contact-links.ts lib/contact-links.test.ts components/common/contact-actions.tsx components/common/contact-actions.test.tsx components/common/trust-line.tsx components/common/trust-line.test.tsx config/imagery.ts config/site.ts app/globals.css components/ui/button.tsx components/ui/whatsapp-button.tsx components/layout/footer.tsx components/home/hero-section.tsx "app/(main)/contact/page.tsx" "app/(main)/thank-you/page.tsx"
git commit -m "feat: add WhatsApp and call primitives, trust line, and brand tokens"
```

---

### Task 4: Pricing and Offer schema

**Files:**
- Create: `lib/pricing.ts`, `lib/pricing.test.ts`
- Modify: `app/(main)/packages/[id]/page.tsx` (`offers` in Service JSON-LD)

**Interfaces:**
- Produces: `interface PriceFields { priceFrom?: number; priceCurrency?: PriceCurrency; priceUnit?: PriceUnit }`, `formatPrice(price: PriceFields): string | null`, `PRICE_ON_REQUEST = "Price on request"`, `buildOffer(price: PriceFields, url: string): Record<string, unknown> | undefined`.

- [ ] **Step 1: Failing test.** Create `lib/pricing.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildOffer, formatPrice } from "./pricing"

describe("formatPrice", () => {
  it("formats USD per jeep", () => {
    expect(formatPrice({ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" })).toBe(
      "From US$45 per jeep"
    )
  })

  it("groups LKR thousands", () => {
    expect(formatPrice({ priceFrom: 12000, priceCurrency: "LKR", priceUnit: "per person" })).toBe(
      "From LKR 12,000 per person"
    )
  })

  it("keeps meaningful decimals", () => {
    expect(formatPrice({ priceFrom: 17.5, priceCurrency: "USD", priceUnit: "per person" })).toBe(
      "From US$17.50 per person"
    )
  })

  it.each([[{}], [{ priceFrom: 45 }], [{ priceFrom: 45, priceCurrency: "USD" as const }]])(
    "returns null when incomplete: %o",
    (price) => {
      expect(formatPrice(price)).toBeNull()
    }
  )
})

describe("buildOffer", () => {
  const url = "https://www.ceylonsafari.com/packages/hurulu-eco-park-safari"

  it("builds a schema.org Offer", () => {
    expect(buildOffer({ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }, url)).toEqual({
      "@type": "Offer",
      price: 45,
      priceCurrency: "USD",
      url,
      availability: "https://schema.org/InStock",
      description: "From US$45 per jeep",
    })
  })

  it("is omitted without a complete price", () => {
    expect(buildOffer({ priceFrom: 45 }, url)).toBeUndefined()
  })
})
```

Run: `pnpm test lib/pricing.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement.** Create `lib/pricing.ts`:

```ts
import type { PriceCurrency, PriceUnit } from "@/lib/package-catalog"

export const PRICE_ON_REQUEST = "Price on request"

export interface PriceFields {
  priceFrom?: number
  priceCurrency?: PriceCurrency
  priceUnit?: PriceUnit
}

const CURRENCY_PREFIX: Record<PriceCurrency, string> = { USD: "US$", LKR: "LKR " }

export function formatPrice({ priceFrom, priceCurrency, priceUnit }: PriceFields): string | null {
  if (priceFrom == null || !priceCurrency || !priceUnit) return null
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(priceFrom) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(priceFrom)
  return `From ${CURRENCY_PREFIX[priceCurrency]}${amount} ${priceUnit}`
}

export function buildOffer(price: PriceFields, url: string): Record<string, unknown> | undefined {
  const label = formatPrice(price)
  if (!label) return undefined
  return {
    "@type": "Offer",
    price: price.priceFrom,
    priceCurrency: price.priceCurrency,
    url,
    availability: "https://schema.org/InStock",
    description: label,
  }
}
```

In `app/(main)/packages/[id]/page.tsx`, add `offers: buildOffer(packageData, canonicalUrl),` to the `Service` object.

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

- [ ] **Step 3: Commit.**

```bash
git add lib/pricing.ts lib/pricing.test.ts "app/(main)/packages/[id]/page.tsx"
git commit -m "feat: format from-prices and publish them as schema.org offers"
```

---

### Task 5: Season strip

**Files:**
- Create: `components/packages/season-strip.tsx`, `components/packages/season-strip.test.tsx`

**Interfaces:**
- Consumes: `buildSeasonCells`, `describeSeason` (Task 2).
- Produces: `<SeasonStrip season?: Season; size?: "sm" | "md"; className? />`. It renders `null` without data.

- [ ] **Step 1: Failing test.** Create `components/packages/season-strip.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SeasonStrip } from "./season-strip"

describe("SeasonStrip", () => {
  it("renders nothing without season data", () => {
    expect(renderToStaticMarkup(<SeasonStrip />)).toBe("")
    expect(renderToStaticMarkup(<SeasonStrip season={{ peak: [], good: [] }} />)).toBe("")
  })

  it("renders 12 months with an accessible summary", () => {
    const html = renderToStaticMarkup(<SeasonStrip season={{ peak: [8, 9], good: [7] }} />)
    expect(html.match(/data-level=/g)).toHaveLength(12)
    expect(html.match(/data-level="peak"/g)).toHaveLength(2)
    expect(html).toContain('aria-label="Best: Aug–Sep. Good: Jul."')
  })

  it("ignores invalid months", () => {
    const html = renderToStaticMarkup(<SeasonStrip season={{ peak: [13, 8], good: [] }} />)
    expect(html.match(/data-level="peak"/g)).toHaveLength(1)
  })
})
```

Run: `pnpm test components/packages/season-strip.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement.** Create `components/packages/season-strip.tsx`:

```tsx
import type { Season } from "@/lib/package-serialize"
import { buildSeasonCells, describeSeason } from "@/lib/season"
import { cn } from "@/lib/utils"

const LEVEL = {
  peak: "bg-primary text-primary-foreground",
  good: "bg-secondary text-secondary-foreground",
  off: "bg-surface-sunken text-muted-foreground",
} as const

export function SeasonStrip({
  season,
  size = "md",
  className,
}: {
  season?: Season
  size?: "sm" | "md"
  className?: string
}) {
  const cells = buildSeasonCells(season)
  const summary = describeSeason(season)
  if (!cells || !summary) return null

  return (
    <div className={cn("grid gap-2", className)}>
      <div role="img" aria-label={summary} className="grid grid-cols-12 gap-0.5">
        {cells.map((cell) => (
          <span
            key={cell.month}
            data-level={cell.level}
            title={`${cell.label}: ${cell.level === "off" ? "quieter" : cell.level === "peak" ? "best" : "good"}`}
            className={cn(
              "flex items-center justify-center font-medium tabular-nums",
              size === "sm" ? "h-5 text-[10px]" : "h-8 text-xs",
              LEVEL[cell.level]
            )}
          >
            {cell.initial}
          </span>
        ))}
      </div>
      {size === "md" && <p className="text-sm text-muted-foreground">{summary}</p>}
    </div>
  )
}
```

Run: `pnpm test components/packages/season-strip.test.tsx`
Expected: PASS.

- [ ] **Step 3: Commit.**

```bash
git add components/packages/season-strip.tsx components/packages/season-strip.test.tsx
git commit -m "feat: add a season strip showing the best months to visit"
```

---

### Task 6: Chrome: mobile contact bar, navbar, layout

**Files:**
- Create: `components/common/mobile-contact-bar.tsx`, `components/common/mobile-contact-bar.test.tsx`
- Modify: `components/layout/navbar.tsx`, `app/(main)/layout.tsx`
- Delete: `components/ui/whatsapp-button.tsx`

**Interfaces:**
- Consumes: `buildWhatsAppUrl`, `TEL_HREF`, `formatPrice`, `PRICE_ON_REQUEST`.
- Produces: `<MobileContactBar packageName? price?: PriceFields />`, which renders its own spacer.

- [ ] **Step 1: Failing test.** Create `components/common/mobile-contact-bar.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { MobileContactBar } from "./mobile-contact-bar"

describe("MobileContactBar", () => {
  it("renders a spacer so the fixed bar never covers the footer", () => {
    const html = renderToStaticMarkup(<MobileContactBar />)
    expect(html).toMatch(/aria-hidden="true"[^>]*class="[^"]*h-20[^"]*md:hidden/)
  })

  it("is hidden from md up and padded for the phone's safe area", () => {
    const html = renderToStaticMarkup(<MobileContactBar />)
    expect(html).toContain("md:hidden")
    expect(html).toContain("env(safe-area-inset-bottom")
  })

  it("shows the price and prefills the package when given", () => {
    const html = renderToStaticMarkup(
      <MobileContactBar
        packageName="Minneriya Safari"
        price={{ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }}
      />
    )
    expect(html).toContain("From US$45 per jeep")
    expect(html).toContain(encodeURIComponent("Minneriya Safari"))
  })

  it("says price on request for a package without a price", () => {
    expect(renderToStaticMarkup(<MobileContactBar packageName="Village Tour" price={{}} />)).toContain(
      "Price on request"
    )
  })
})
```

Run: `pnpm test components/common/mobile-contact-bar.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement.** Create `components/common/mobile-contact-bar.tsx`:

```tsx
import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"

import { buttonVariants } from "@/components/ui/button"
import { buildWhatsAppUrl, TEL_HREF } from "@/lib/contact-links"
import { formatPrice, PRICE_ON_REQUEST, type PriceFields } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export function MobileContactBar({ packageName, price }: { packageName?: string; price?: PriceFields }) {
  const priceLabel = price ? (formatPrice(price) ?? PRICE_ON_REQUEST) : null

  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center gap-3">
          {priceLabel && (
            <p className="min-w-0 flex-1 text-sm leading-tight font-semibold">{priceLabel}</p>
          )}
          <a
            href={buildWhatsAppUrl({ packageName })}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), priceLabel ? "px-5" : "flex-1")}
          >
            <WhatsappLogo weight="fill" className="size-5" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            href={TEL_HREF}
            aria-label="Call us"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-4")}
          >
            <Phone className="size-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  )
}
```

Run: `pnpm test components/common/mobile-contact-bar.test.tsx`
Expected: PASS.

- [ ] **Step 3: Navbar and layout.**

`components/layout/navbar.tsx`:
- Desktop: replace the "Send Inquiry" `Button asChild` + `Link` with `<Button asChild variant="whatsapp" className="ml-4"><a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer"><WhatsappLogo weight="fill" /> WhatsApp us</a></Button>`.
- Mobile: wrap the menu button in `<div className="flex items-center gap-4 lg:hidden">`. Put a call link before it (`<a href={TEL_HREF} aria-label={`Call ${siteConfig.name}`} className="text-2xl"><Phone className="text-current" /></a>`) and drop `lg:hidden` from the button itself.
- In the mobile menu, replace the single "Send Inquiry" button with two stacked buttons: WhatsApp (`variant="whatsapp"`) and `<Button asChild variant="outline"><Link href="/book-now">Send an inquiry form</Link></Button>`.
- Import `WhatsappLogo` and `Phone` from `@phosphor-icons/react`.

`app/(main)/layout.tsx`: remove `WhatsAppButton` and its import, and change the outer `<main className="flex-grow">` to `<div className="flex-grow">`, since pages render their own `<main>`. Delete `components/ui/whatsapp-button.tsx`.

- [ ] **Step 4: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint && grep -rn "whatsapp-button" app components`
Expected: PASS / clean / no grep output.

```bash
git add components/common/mobile-contact-bar.tsx components/common/mobile-contact-bar.test.tsx components/layout/navbar.tsx "app/(main)/layout.tsx" components/ui/whatsapp-button.tsx
git commit -m "feat: sticky mobile contact bar and WhatsApp-first navigation"
```

---

### Task 7: Package card and grouped listing

**Files:**
- Modify: `lib/package-catalog.ts` (+`groupPackagesByCategory`, `CATEGORY_SECTIONS`), `lib/package-catalog.test.ts`
- Rewrite: `components/ui/package-card.tsx`; Create: `components/ui/package-card.test.tsx`
- Rewrite: `app/(main)/packages/page.tsx`

**Interfaces:**
- Consumes: `PublicPackage`, `sortPackages`, `formatPrice`, `SeasonStrip`, `buildWhatsAppUrl`.
- Produces:
  - `CATEGORY_SECTIONS: ReadonlyArray<{ key: PackageCategory | "other"; title: string; intro: string }>`
  - `groupPackagesByCategory<T extends OrderablePackage>(items: readonly T[]): Array<{ key: PackageCategory | "other"; title: string; intro: string; items: T[] }>`
  - `<PackageCard pkg: PublicPackage; priority?: boolean />`

- [ ] **Step 1: Failing tests.** Append to `lib/package-catalog.test.ts`:

```ts
import { groupPackagesByCategory } from "./package-catalog"

describe("groupPackagesByCategory", () => {
  it("orders groups safari → experience → tour → stay → other and skips empty ones", () => {
    const groups = groupPackagesByCategory([
      item("cottage", { category: "stay" }),
      item("loose"),
      item("hurulu", { category: "safari", sortOrder: 2 }),
      item("minneriya", { category: "safari", sortOrder: 1 }),
    ])
    expect(groups.map((g) => g.key)).toEqual(["safari", "stay", "other"])
    expect(groups[0].items.map((p) => p._id)).toEqual(["minneriya", "hurulu"])
  })
})
```

Create `components/ui/package-card.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { PublicPackage } from "@/lib/package-serialize"
import PackageCard from "./package-card"

const pkg: PublicPackage = {
  _id: "a".repeat(24),
  slug: "minneriya-national-park-safari",
  name: "Minneriya National Park Safari",
  description: "Long description that must not be repeated on cards.",
  duration: "3 hours",
  included: ["Private jeep", "Water"],
  images: ["https://res.cloudinary.com/travelhabarana/image/upload/x.jpg"],
  category: "safari",
  summary: "Elephants at the tank.",
}

describe("PackageCard", () => {
  it("shows summary, duration and price on request without repeating included or description", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={pkg} />)
    expect(html).toContain("Elephants at the tank.")
    expect(html).toContain("3 hours")
    expect(html).toContain("Price on request")
    expect(html).not.toContain("Long description")
    expect(html).not.toContain("Water")
  })

  it("shows the from-price when set", () => {
    const html = renderToStaticMarkup(
      <PackageCard pkg={{ ...pkg, priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }} />
    )
    expect(html).toContain("From US$45 per jeep")
  })

  it("keeps the WhatsApp link outside the card link", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={pkg} />)
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<a /s)
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<button/s)
    expect(html).toContain("wa.me")
  })

  it("falls back to a truncated description without a summary", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={{ ...pkg, summary: undefined }} />)
    expect(html).toContain("Long description")
  })
})
```

Run: `pnpm test lib/package-catalog.test.ts components/ui/package-card.test.tsx`
Expected: FAIL. `groupPackagesByCategory` is not exported, and `PackageCard` has no `pkg` prop.

**If `next/image` throws under Vitest** because remote host `res.cloudinary.com` isn't configured (it reads `process.env.__NEXT_IMAGE_OPTS`, which only `next build`/`next dev` inject), create `vitest.setup.ts`:

```ts
process.env.__NEXT_IMAGE_OPTS = JSON.stringify({
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: "/_next/image",
  loader: "default",
  dangerouslyAllowSVG: false,
  unoptimized: false,
  remotePatterns: [
    { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
  ],
})
```

Register it with `test.setupFiles: ["./vitest.setup.ts"]` in `vitest.config.mts`. Don't mock `next/image`: the tests must exercise the real markup.

- [ ] **Step 2: Implement.** Append to `lib/package-catalog.ts`:

```ts
export const CATEGORY_SECTIONS = [
  { key: "safari", title: "Jeep safaris", intro: "Private jeep safaris to Minneriya, Kaudulla and Hurulu Eco Park from Habarana." },
  { key: "experience", title: "Village & food experiences", intro: "Slow afternoons in a Habarana village: farming, a bullock cart ride and a home-cooked meal." },
  { key: "tour", title: "Day tours", intro: "Ancient cities and temples of the Cultural Triangle with a local driver-guide." },
  { key: "stay", title: "Stays", intro: "Places to stay in Habarana between safaris." },
  { key: "other", title: "More tours", intro: "Other experiences we arrange around Habarana." },
] as const satisfies ReadonlyArray<{ key: PackageCategory | "other"; title: string; intro: string }>

export function groupPackagesByCategory<T extends OrderablePackage>(items: readonly T[]) {
  const sorted = sortPackages(items)
  return CATEGORY_SECTIONS.map((section) => ({
    ...section,
    items: sorted.filter((p) => (p.category ?? "other") === section.key),
  })).filter((group) => group.items.length > 0)
}
```

The intros describe the category types the site already sells. They make no pricing, timing or policy claims.

Rewrite `components/ui/package-card.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, Image as ImageIcon, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"

import { SeasonStrip } from "@/components/packages/season-strip"
import { buildWhatsAppUrl } from "@/lib/contact-links"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"
import { truncateAtWord } from "@/lib/seo"

export default function PackageCard({ pkg, priority = false }: { pkg: PublicPackage; priority?: boolean }) {
  const href = `/packages/${pkg.slug}`
  const price = formatPrice(pkg)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="group block">
        <div className="relative aspect-[4/3] bg-surface-sunken">
          {pkg.images[0] ? (
            <Image
              src={pkg.images[0]}
              alt={pkg.name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageIcon size={48} aria-hidden="true" />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded bg-background/90 px-2 py-1 text-xs font-medium">
            <Clock className="size-3.5" aria-hidden="true" />
            {pkg.duration}
          </span>
        </div>
        <div className="grid gap-2 px-5 pt-5">
          <h3 className="text-xl leading-snug group-hover:underline group-hover:underline-offset-4">{pkg.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {pkg.summary ?? truncateAtWord(pkg.description, 140)}
          </p>
        </div>
      </Link>
      <div className="mt-auto grid gap-4 px-5 pt-4 pb-5">
        {pkg.category === "safari" && <SeasonStrip season={pkg.season} size="sm" />}
        <p className={price ? "font-semibold" : "text-sm text-muted-foreground"}>{price ?? PRICE_ON_REQUEST}</p>
        <div className="flex items-center justify-between gap-3 text-sm font-medium">
          <Link href={href} className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
            View details <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={buildWhatsAppUrl({ packageName: pkg.name })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
          >
            <WhatsappLogo weight="fill" className="size-4 text-whatsapp" aria-hidden="true" />
            Ask
          </a>
        </div>
      </div>
    </article>
  )
}
```

Rewrite `app/(main)/packages/page.tsx`:

```tsx
import FAQSection from "@/components/common/faq-section"
import { MobileContactBar } from "@/components/common/mobile-contact-bar"
import { TrustLine } from "@/components/common/trust-line"
import { JsonLd } from "@/components/seo/json-ld"
import PackageCard from "@/components/ui/package-card"
import { siteConfig } from "@/config/site"
import { groupPackagesByCategory } from "@/lib/package-catalog"
import { getPackages } from "@/lib/packages"
import { cn } from "@/lib/utils"

export default async function PackagesPage() {
  const packages = await getPackages()
  const groups = groupPackagesByCategory(packages)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ceylon Safari packages",
    itemListElement: groups
      .flatMap((group) => group.items)
      .map((packageItem, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: packageItem.name,
        url: new URL(`/packages/${packageItem.slug}`, siteConfig.url).toString(),
      })),
  }

  return (
    <main>
      <JsonLd data={itemListSchema} />
      <section className="bg-primary px-4 pt-28 pb-12 text-primary-foreground">
        <div className="container mx-auto grid max-w-3xl gap-4">
          <h1>Habarana Safari &amp; Village Tour Packages</h1>
          <p className="text-lg text-primary-foreground/90">
            Private jeeps, local guides and hotel pickup. Message us your dates and we&apos;ll reply with availability and
            the current price.
          </p>
          <TrustLine tone="light" />
        </div>
      </section>

      {groups.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground">No packages available at the moment.</p>
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.key}
            aria-labelledby={`group-${group.key}`}
            className={cn("px-4 py-14", groupIndex % 2 === 1 && "bg-surface-sunken")}
          >
            <div className="container mx-auto grid gap-6">
              <div className="grid max-w-2xl gap-2">
                <h2 id={`group-${group.key}`}>{group.title}</h2>
                <p className="text-muted-foreground">{group.intro}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((pkg, index) => (
                  <PackageCard key={pkg._id} pkg={pkg} priority={groupIndex === 0 && index < 2} />
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <FAQSection variant="safari" />
      <MobileContactBar />
    </main>
  )
}
```

Update `components/home/packages-section.tsx` callers to pass `pkg` (it is replaced in Task 9 anyway, so compile-fix only).

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

- [ ] **Step 3: Commit.**

```bash
git add lib/package-catalog.ts lib/package-catalog.test.ts components/ui/package-card.tsx components/ui/package-card.test.tsx "app/(main)/packages/page.tsx" components/home/packages-section.tsx
git commit -m "feat: price-first package cards and category-grouped listing"
```

---

### Task 8: Package landing page

**Files:**
- Create: `components/packages/package-gallery.tsx`, `components/packages/booking-panel.tsx`, `components/packages/landing-sections.tsx`, `components/packages/landing-sections.test.tsx`, `components/common/final-cta.tsx`
- Create: `lib/package-meta.ts`, `lib/package-meta.test.ts`
- Rewrite: `app/(main)/packages/[id]/page.tsx` (composition + metadata)
- Delete: `app/(main)/packages/[id]/package-details.tsx`, `components/ui/image-gallery.tsx` (after confirming no other importer via `grep -rn "image-gallery\|package-details" app components`)

**Interfaces:**
- Consumes: everything above plus `selectRelatedPackages`, `splitParagraphs`, `TrustLine`, `ContactActions`, `MobileContactBar`.
- Produces:
  - `resolvePackageMeta(pkg: PublicPackage): { title: string; description: string }`
  - `<PackageGallery images: string[]; name: string />`
  - `<BookingPanel pkg: PublicPackage />`
  - `<FactChips pkg />`, `<Highlights items? />`, `<WhenToGo season? />`, `<Itinerary steps? />`, `<IncludedList included notIncluded? />`, `<PickupAndTimes pickupAreas? timeSlots? />`, `<WhatToBring items? />`, `<AboutExperience description />`, `<PackageFaqs faqs? />`. Each returns `null` without data.
  - `<FinalCta title? packageName? />`

- [ ] **Step 1: Failing tests.** Create `lib/package-meta.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import type { PublicPackage } from "./package-serialize"
import { resolvePackageMeta } from "./package-meta"

const pkg = {
  _id: "a".repeat(24),
  slug: "hurulu-eco-park-safari",
  name: "Hurulu Eco Park Safari",
  description:
    "Embark on a private jeep safari through Hurulu Eco Park, where herds of wild elephants gather near the reservoir and our local guide explains their behaviour along the way.",
  duration: "3 hours",
  included: [],
  images: [],
} satisfies PublicPackage

describe("resolvePackageMeta", () => {
  it("prefers the admin SEO fields", () => {
    expect(
      resolvePackageMeta({ ...pkg, seoTitle: "Hurulu Jeep Safari from Habarana", seoDescription: "Short." })
    ).toEqual({ title: "Hurulu Jeep Safari from Habarana | Ceylon Safari", description: "Short." })
  })

  it("does not double the brand when the SEO title already has it", () => {
    expect(resolvePackageMeta({ ...pkg, seoTitle: "Hurulu Safari | Ceylon Safari" }).title).toBe(
      "Hurulu Safari | Ceylon Safari"
    )
  })

  it("falls back to name, then summary, then a word-safe description", () => {
    expect(resolvePackageMeta(pkg).title).toBe("Hurulu Eco Park Safari | Ceylon Safari")
    expect(resolvePackageMeta({ ...pkg, summary: "Elephants at Hurulu." }).description).toBe(
      "Elephants at Hurulu."
    )
    const description = resolvePackageMeta(pkg).description
    expect(description.length).toBeLessThanOrEqual(160)
    expect(description.endsWith("…")).toBe(true)
  })
})
```

Create `components/packages/landing-sections.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  AboutExperience,
  FactChips,
  Highlights,
  IncludedList,
  Itinerary,
  PackageFaqs,
  PickupAndTimes,
  WhatToBring,
  WhenToGo,
} from "./landing-sections"
import { BookingPanel } from "./booking-panel"

const html = (node: React.ReactElement) => renderToStaticMarkup(node)

describe("landing sections omit themselves without data", () => {
  it.each([
    ["Highlights", <Highlights key="h" />],
    ["WhenToGo", <WhenToGo key="w" />],
    ["Itinerary", <Itinerary key="i" steps={[]} />],
    ["PickupAndTimes", <PickupAndTimes key="p" />],
    ["WhatToBring", <WhatToBring key="b" />],
    ["PackageFaqs", <PackageFaqs key="f" />],
  ])("%s", (_name, node) => {
    expect(html(node)).toBe("")
  })
})

describe("landing sections with data", () => {
  it("renders the itinerary as an ordered list with times", () => {
    const out = html(<Itinerary steps={[{ time: "2:30 pm", title: "Pickup" }, { title: "Game drive" }]} />)
    expect(out).toContain("<ol")
    expect(out).toContain("2:30 pm")
    expect(out).toContain("Game drive")
  })

  it("renders every FAQ answer in server HTML", () => {
    const out = html(<PackageFaqs faqs={[{ question: "Private?", answer: "Yes, only your group." }]} />)
    expect(out).toContain("Yes, only your group.")
  })

  it("shows included and not included side by side", () => {
    const out = html(<IncludedList included={["Jeep"]} notIncluded={["Tickets"]} />)
    expect(out).toContain("Jeep")
    expect(out).toContain("Not included")
    expect(out).toContain("Tickets")
  })

  it("splits the description into paragraphs", () => {
    expect(html(<AboutExperience description={"First.\n\nSecond."} />).match(/<p/g)).toHaveLength(2)
  })

  it("fact chips show only known facts", () => {
    const out = html(<FactChips duration="3 hours" pickupAreas={["Habarana"]} />)
    expect(out).toContain("3 hours")
    expect(out).toContain("Hotel pickup")
    expect(out).not.toContain("per jeep")
  })
})

describe("BookingPanel", () => {
  const pkg = {
    _id: "a".repeat(24),
    slug: "village-experience-tour",
    name: "Village Experience Tour",
    description: "x",
    duration: "4 hours",
    included: [],
    images: [],
  }

  it("says price on request, offers WhatsApp, call and the form, with no nested controls", () => {
    const out = html(<BookingPanel pkg={pkg} />)
    expect(out).toContain("Price on request")
    expect(out).toContain("wa.me")
    expect(out).toContain('href="tel:+94766675883"')
    expect(out).toContain(`/book-now?packageId=${"a".repeat(24)}`)
    expect(out).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<button/s)
    expect(out).not.toMatch(/opacity:\s*0/)
  })

  it("never claims free cancellation or instant confirmation", () => {
    expect(html(<BookingPanel pkg={pkg} />)).not.toMatch(/free cancellation|instant confirmation/i)
  })
})
```

Run: `pnpm test lib/package-meta.test.ts components/packages/landing-sections.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 2: Implement the meta helper.** Create `lib/package-meta.ts`:

```ts
import { siteConfig } from "@/config/site"
import type { PublicPackage } from "@/lib/package-serialize"
import { buildPackageTitle, truncateAtWord } from "@/lib/seo"

export function resolvePackageMeta(pkg: PublicPackage): { title: string; description: string } {
  const title = pkg.seoTitle
    ? pkg.seoTitle.includes(siteConfig.name)
      ? pkg.seoTitle
      : buildPackageTitle(pkg.seoTitle)
    : buildPackageTitle(pkg.name)
  const description = pkg.seoDescription ?? truncateAtWord(pkg.summary ?? pkg.description)
  return { title, description }
}
```

- [ ] **Step 3: Implement the sections.** Create `components/packages/landing-sections.tsx` as a server component. All sections share a small `Section` wrapper: `<section aria-labelledby={id} className="grid gap-4"><h2 id={id} className="text-2xl md:text-3xl">{title}</h2>{children}</section>`, where `id` comes from a slugified title.

```tsx
import { Check, Clock, MapPin, Sun, Users, X } from "@phosphor-icons/react/dist/ssr"

import { SeasonStrip } from "@/components/packages/season-strip"
import { splitParagraphs } from "@/lib/package-landing"
import type { ItineraryStep, PackageFaq, Season } from "@/lib/package-serialize"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <h2 id={id} className="text-2xl md:text-3xl">{title}</h2>
      {children}
    </section>
  )
}

export function FactChips({
  duration,
  groupSize,
  timeSlots,
  pickupAreas,
}: {
  duration: string
  groupSize?: string
  timeSlots?: string[]
  pickupAreas?: string[]
}) {
  const chips = [
    { icon: Clock, label: duration },
    groupSize && { icon: Users, label: groupSize },
    timeSlots?.length && { icon: Sun, label: timeSlots.join(" · ") },
    pickupAreas?.length && { icon: MapPin, label: "Hotel pickup" },
  ].filter(Boolean) as Array<{ icon: typeof Clock; label: string }>

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Key facts">
      {chips.map(({ icon: Icon, label }) => (
        <li key={label} className="inline-flex items-center gap-1.5 rounded border bg-card px-3 py-1.5 text-sm">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}

function CheckList({ items, icon: Icon = Check }: { items: string[]; icon?: typeof Check }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Icon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Highlights({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <Section title="Why travellers choose it">
      <CheckList items={items} />
    </Section>
  )
}

export function WhenToGo({ season }: { season?: Season }) {
  if (!season) return null
  const strip = <SeasonStrip season={season} />
  return <Section title="When to go">{strip}</Section>
}

export function Itinerary({ steps }: { steps?: ItineraryStep[] }) {
  if (!steps?.length) return null
  return (
    <Section title="How the day runs">
      <ol className="grid gap-4 border-l-2 border-primary/30 pl-6">
        {steps.map((step, index) => (
          <li key={`${index}-${step.title}`} className="relative grid gap-0.5">
            <span className="absolute top-1.5 -left-[31px] size-3 rounded-full bg-primary" aria-hidden="true" />
            {step.time && <span className="text-sm font-medium text-primary tabular-nums">{step.time}</span>}
            <span className="font-semibold">{step.title}</span>
            {step.detail && <span className="text-muted-foreground">{step.detail}</span>}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function IncludedList({ included, notIncluded }: { included: string[]; notIncluded?: string[] }) {
  if (!included.length && !notIncluded?.length) return null
  return (
    <Section title="What's included">
      <div className="grid gap-6 md:grid-cols-2">
        {included.length > 0 && <CheckList items={included} />}
        {notIncluded?.length ? (
          <div className="grid gap-2">
            <h3 className="text-base font-semibold">Not included</h3>
            <CheckList items={notIncluded} icon={X} />
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export function PickupAndTimes({ pickupAreas, timeSlots }: { pickupAreas?: string[]; timeSlots?: string[] }) {
  if (!pickupAreas?.length && !timeSlots?.length) return null
  return (
    <Section title="Pickup and start times">
      <dl className="grid gap-4 sm:grid-cols-2">
        {pickupAreas?.length ? (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Free hotel pickup from</dt>
            <dd>{pickupAreas.join(", ")}</dd>
          </div>
        ) : null}
        {timeSlots?.length ? (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Start times</dt>
            <dd className="tabular-nums">{timeSlots.join(" · ")}</dd>
          </div>
        ) : null}
      </dl>
    </Section>
  )
}

export function WhatToBring({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <Section title="What to bring">
      <CheckList items={items} />
    </Section>
  )
}

export function AboutExperience({ description }: { description: string }) {
  const paragraphs = splitParagraphs(description)
  if (!paragraphs.length) return null
  return (
    <Section title="About this experience">
      <div className="grid max-w-prose gap-4 leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </Section>
  )
}

export function PackageFaqs({ faqs }: { faqs?: PackageFaq[] }) {
  if (!faqs?.length) return null
  return (
    <Section title="Questions travellers ask">
      <div className="grid gap-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="group rounded-lg border bg-card p-4 open:shadow-sm">
            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
            <p className="mt-2 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
```

The pickup label reads "Free hotel pickup from" **only** because the live FAQ already promises complimentary pickup for Habarana, Sigiriya and Dambulla. If the owner's confirmed facts differ, the owner sets `pickupAreas` accordingly.

- [ ] **Step 4: Booking panel, gallery, final CTA.** Create `components/packages/booking-panel.tsx`:

```tsx
import Link from "next/link"

import { ContactActions } from "@/components/common/contact-actions"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"

export function BookingPanel({ pkg }: { pkg: PublicPackage }) {
  const price = formatPrice(pkg)
  return (
    <aside aria-label="Book this experience" className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <div className="grid gap-1">
        <p className="text-2xl font-semibold">{price ?? PRICE_ON_REQUEST}</p>
        <p className="text-sm text-muted-foreground">{pkg.priceNote ?? "We reply within 24 hours with availability."}</p>
      </div>
      <ContactActions packageName={pkg.name} stacked />
      <p className="text-center text-sm text-muted-foreground">
        Prefer email?{" "}
        <Link href={`/book-now?packageId=${pkg._id}`} className="font-medium text-primary underline-offset-4 hover:underline">
          Send an inquiry form
        </Link>
      </p>
      <ul className="grid gap-1 border-t pt-4 text-sm text-muted-foreground">
        <li>No payment needed to ask</li>
        {/* Restates the existing "Private Jeep Safaris" promise; safaris only. */}
        {pkg.category === "safari" && <li>Private jeep for your group only</li>}
      </ul>
    </aside>
  )
}
```

Add this case to the `BookingPanel` describe block in `landing-sections.test.tsx`:

```tsx
  it("promises a private jeep only on safaris", () => {
    expect(html(<BookingPanel pkg={pkg} />)).not.toContain("Private jeep")
    expect(html(<BookingPanel pkg={{ ...pkg, category: "safari" }} />)).toContain("Private jeep")
  })
```

Create `components/packages/package-gallery.tsx`:

```tsx
import Image from "next/image"
import { Image as ImageIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

export function PackageGallery({ images, name }: { images: string[]; name: string }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-surface-sunken text-muted-foreground md:aspect-[21/8]">
        <ImageIcon size={56} aria-hidden="true" />
      </div>
    )
  }

  const desktop = images.slice(0, 5)

  return (
    <>
      {/* Mobile: swipe strip */}
      <div className="relative -mx-4 md:hidden">
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2" aria-label={`${name} photos`}>
          {images.map((src, index) => (
            <li key={src} className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-lg">
              <Image src={src} alt={`${name}, photo ${index + 1}`} fill priority={index === 0} sizes="85vw" className="object-cover" />
            </li>
          ))}
        </ul>
        {images.length > 1 && (
          <span className="pointer-events-none absolute top-3 left-7 rounded bg-background/90 px-2 py-1 text-xs font-medium">
            {images.length} photos · swipe
          </span>
        )}
      </div>

      {/* Desktop: mosaic */}
      <div
        className={cn(
          "hidden h-[420px] gap-2 overflow-hidden rounded-lg md:grid",
          desktop.length === 1 ? "grid-cols-1" : "grid-cols-4 grid-rows-2"
        )}
      >
        {desktop.map((src, index) => (
          <div
            key={src}
            className={cn("relative bg-surface-sunken", spanFor(index, desktop.length))}
          >
            <Image
              src={src}
              alt={`${name}, photo ${index + 1}`}
              fill
              priority={index === 0}
              sizes={index === 0 ? "50vw" : "25vw"}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  )
}
```

With 2–4 images a 4×2 mosaic leaves holes, so the tile spans come from an exported helper in the same file. Use it in place of the inline span above: `className={cn("relative bg-surface-sunken", spanFor(index, desktop.length))}`.

```ts
/**
 * Tile spans that exactly fill the 4×2 desktop grid.
 * 2 → lead + tall right half · 3 → lead + two wide tiles · 4 → lead + 2 small + 1 wide · 5 → lead + 4 small.
 */
export function spanFor(index: number, count: number): string {
  if (count <= 1) return ""
  if (index === 0) return "col-span-2 row-span-2"
  if (count === 2) return "col-span-2 row-span-2"
  if (count === 3) return "col-span-2"
  if (count === 4 && index === count - 1) return "col-span-2"
  return ""
}
```

Test, appended to `landing-sections.test.tsx`:

```tsx
import { spanFor } from "./package-gallery"

describe("spanFor fills the desktop mosaic", () => {
  const cells = (span: string) => (span === "col-span-2 row-span-2" ? 4 : span === "col-span-2" ? 2 : 1)

  it.each([2, 3, 4, 5])("uses exactly 8 cells with %i images", (count) => {
    const used = Array.from({ length: count }, (_, i) => cells(spanFor(i, count))).reduce((a, b) => a + b, 0)
    expect(used).toBe(8)
  })

  it("adds no span for a single image", () => {
    expect(spanFor(0, 1)).toBe("")
  })
})
```

Create `components/common/final-cta.tsx`:

```tsx
import { ContactActions } from "@/components/common/contact-actions"

export function FinalCta({
  title = "Ready to see the elephants?",
  packageName,
}: {
  title?: string
  packageName?: string
}) {
  return (
    <section className="bg-primary px-4 py-16 text-primary-foreground">
      <div className="container mx-auto grid max-w-3xl justify-items-center gap-5 text-center">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        <p className="max-w-xl text-primary-foreground/85">
          Send us your date and hotel. We'll reply with the park, the time and the current price. No payment needed to ask.
        </p>
        <ContactActions packageName={packageName} className="justify-center" />
      </div>
    </section>
  )
}
```

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Compose the page.** Rewrite the body of `app/(main)/packages/[id]/page.tsx` and keep `generateStaticParams`, the not-found handling, the slug `permanentRedirect` and the JSON-LD (now with `offers`). `generateMetadata` uses `resolvePackageMeta(packageData)`, with `title: { absolute: meta.title }` and the same values for OG/Twitter. Render:

```tsx
    <main className="bg-background pt-20">
      <JsonLd data={structuredData} />
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs name={packageData.name} />
        <PackageGallery images={packageData.images} name={packageData.name} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-10">
            <header className="grid gap-4">
              <h1>{packageData.name}</h1>
              {packageData.summary && <p className="max-w-prose text-lg text-muted-foreground">{packageData.summary}</p>}
              <TrustLine />
              <FactChips
                duration={packageData.duration}
                groupSize={packageData.groupSize}
                timeSlots={packageData.timeSlots}
                pickupAreas={packageData.pickupAreas}
              />
            </header>
            <div className="lg:hidden"><BookingPanel pkg={packageData} /></div>
            <Highlights items={packageData.highlights} />
            <WhenToGo season={packageData.season} />
            <Itinerary steps={packageData.itinerary} />
            <IncludedList included={packageData.included} notIncluded={packageData.notIncluded} />
            <PickupAndTimes pickupAreas={packageData.pickupAreas} timeSlots={packageData.timeSlots} />
            <WhatToBring items={packageData.whatToBring} />
            <AboutExperience description={packageData.description} />
            <PackageFaqs faqs={packageData.faqs} />
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24"><BookingPanel pkg={packageData} /></div>
          </div>
        </div>
      </div>
      {relatedPackages.length > 0 && (
        <section className="mt-16 bg-surface-sunken px-4 py-14">
          <div className="container mx-auto grid gap-8">
            <h2>{packageData.category === "safari" ? "Other safaris from Habarana" : "You might also like"}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((p) => <PackageCard key={p._id} pkg={p} />)}
            </div>
          </div>
        </section>
      )}
      <FinalCta packageName={packageData.name} />
      <MobileContactBar packageName={packageData.name} price={packageData} />
    </main>
```

`Breadcrumbs` is a small local server component using the existing `components/ui/breadcrumb` primitives. It's moved from `package-details.tsx`. Delete `package-details.tsx`, and delete `image-gallery.tsx` if grep shows no other importer.

- [ ] **Step 6: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

```bash
git add components/packages components/common/final-cta.tsx lib/package-meta.ts lib/package-meta.test.ts "app/(main)/packages/[id]" components/ui/image-gallery.tsx
git commit -m "feat: rebuild package pages as conversion-first landing pages"
```

---

### Task 9: Homepage

**Files:**
- Rewrite: `components/home/hero-section.tsx`
- Create: `components/home/park-chooser.tsx`, `components/home/park-chooser.test.tsx`, `components/home/real-guests.tsx`, `components/home/how-booking-works.tsx`, `components/home/more-experiences.tsx`
- Rewrite: `app/(main)/page.tsx`
- Delete: `components/home/features-section.tsx`, `components/home/plan-visit-section.tsx`, `components/home/cta-banner-section.tsx`, `components/home/packages-section.tsx`, `components/home/testimonials-section.tsx` (its Elfsight embed moves into `real-guests.tsx`)

**Interfaces:**
- Consumes: `getPackages`, `groupPackagesByCategory`, `PackageCard`, `ContactActions`, `TrustLine`, `FinalCta`, `imagery`, `FAQSection`, `FeaturedBlogsSection`.
- Produces: `<ParkChooser packages: PublicPackage[] />`, which renders `null` when no safari packages exist.

- [ ] **Step 1: Failing test.** Create `components/home/park-chooser.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { PublicPackage } from "@/lib/package-serialize"
import { ParkChooser } from "./park-chooser"

const make = (id: string, extra: Partial<PublicPackage>): PublicPackage => ({
  _id: id.padEnd(24, "0"),
  slug: id,
  name: id,
  description: "d",
  duration: "3 hours",
  included: [],
  images: [],
  ...extra,
})

describe("ParkChooser", () => {
  it("shows only safari packages, in display order", () => {
    const html = renderToStaticMarkup(
      <ParkChooser
        packages={[
          make("village", { category: "experience" }),
          make("hurulu", { category: "safari", sortOrder: 3 }),
          make("minneriya", { category: "safari", sortOrder: 1 }),
        ]}
      />
    )
    expect(html.indexOf("minneriya")).toBeLessThan(html.indexOf("hurulu"))
    expect(html).not.toContain("/packages/village")
    expect(html).toContain("Not sure which park?")
  })

  it("renders nothing without safari packages", () => {
    expect(renderToStaticMarkup(<ParkChooser packages={[make("village", { category: "experience" })]} />)).toBe("")
  })
})
```

Run: `pnpm test components/home/park-chooser.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement the sections.** Create `components/home/park-chooser.tsx`:

```tsx
import PackageCard from "@/components/ui/package-card"
import { groupPackagesByCategory } from "@/lib/package-catalog"
import type { PublicPackage } from "@/lib/package-serialize"

export function ParkChooser({ packages }: { packages: PublicPackage[] }) {
  const safaris = groupPackagesByCategory(packages).find((group) => group.key === "safari")?.items ?? []
  if (!safaris.length) return null

  return (
    <section id="safaris" className="scroll-mt-24 px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="grid max-w-2xl gap-3">
          <h2>Choose your park</h2>
          <p className="text-muted-foreground">
            Minneriya, Kaudulla and Hurulu Eco Park are all a short drive from Habarana. Not sure which park? Send us your
            dates and we&apos;ll suggest the park where the herds are that week.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safaris.map((pkg, index) => (
            <PackageCard key={pkg._id} pkg={pkg} priority={index === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

Rewrite `components/home/hero-section.tsx`:

```tsx
import Image from "next/image"
import { ArrowDown, Car, MapPin, UsersThree } from "@phosphor-icons/react/dist/ssr"

import { ContactActions } from "@/components/common/contact-actions"
import { TrustLine } from "@/components/common/trust-line"
import { imagery } from "@/config/imagery"

const FACTS = [
  { icon: Car, label: "Private jeep" },
  { icon: MapPin, label: "Hotel pickup" },
  { icon: UsersThree, label: "Local guides" },
] as const

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[min(88svh,760px)] items-end overflow-hidden px-4 pt-28 pb-10 md:items-center md:pb-16">
      <Image src={imagery.hero.src} alt={imagery.hero.alt} fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/20" aria-hidden="true" />
      <div className="container mx-auto">
        <div className="grid max-w-2xl gap-5 text-white">
          <h1>Private jeep safaris from Habarana to Minneriya, Kaudulla &amp; Hurulu</h1>
          <p className="text-lg text-white/90 md:text-xl">
            A jeep just for your group, a local guide, and hotel pickup from Habarana, Sigiriya and Dambulla.
          </p>
          <TrustLine tone="light" />
          <ContactActions className="[&_a:last-child]:border-white/60 [&_a:last-child]:bg-transparent [&_a:last-child]:text-white" />
          <a href="#safaris" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
            See the safaris <ArrowDown className="size-4" aria-hidden="true" />
          </a>
          <ul className="flex flex-wrap gap-2 pt-2" aria-label="What every safari includes">
            {FACTS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5 rounded bg-white/15 px-3 py-1.5 text-sm backdrop-blur-sm">
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
```

Create `components/home/real-guests.tsx`:

```tsx
import Image from "next/image"
import Script from "next/script"

import { TrustLine } from "@/components/common/trust-line"
import { imagery } from "@/config/imagery"

export function RealGuests() {
  return (
    <section className="bg-surface-sunken px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="grid max-w-2xl gap-3">
          <h2>Real guests, real herds</h2>
          <TrustLine />
        </div>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {imagery.guests.map((photo) => (
            <li key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </li>
          ))}
        </ul>
        <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
        <div className="elfsight-app-6c7fd0eb-009c-4af4-b5f0-2669602f0f0b" data-elfsight-app-lazy />
      </div>
    </section>
  )
}
```

Create `components/home/how-booking-works.tsx`. The numbered list is a real sequence:

```tsx
import { ContactActions } from "@/components/common/contact-actions"

const STEPS = [
  { title: "Message us your date and hotel", detail: "WhatsApp or call, and tell us how many people are coming." },
  { title: "We confirm the park, time and price", detail: "We reply within 24 hours with availability." },
  { title: "Your guide picks you up", detail: "From your hotel in Habarana, Sigiriya or Dambulla." },
] as const

export function HowBookingWorks() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <h2>How booking works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="grid gap-2 border-t-2 border-primary pt-4">
              <span className="font-serif text-3xl text-primary tabular-nums">{index + 1}</span>
              <h3 className="text-lg">{step.title}</h3>
              <p className="text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-3">
          <p className="font-medium">No payment needed to ask.</p>
          <ContactActions />
        </div>
      </div>
    </section>
  )
}
```

Create `components/home/more-experiences.tsx`:

```tsx
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

import PackageCard from "@/components/ui/package-card"
import { groupPackagesByCategory } from "@/lib/package-catalog"
import type { PublicPackage } from "@/lib/package-serialize"

export function MoreExperiences({ packages }: { packages: PublicPackage[] }) {
  const others = groupPackagesByCategory(packages)
    .filter((group) => group.key !== "safari")
    .flatMap((group) => group.items)
    .slice(0, 6)
  if (!others.length) return null

  return (
    <section className="bg-surface-sunken px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2>More than safaris</h2>
          <Link href="/packages" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
            See all packages <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

Add to `components/home/park-chooser.test.tsx`:

```tsx
import { MoreExperiences } from "./more-experiences"

describe("MoreExperiences", () => {
  it("shows non-safari packages and renders nothing when there are none", () => {
    const html = renderToStaticMarkup(
      <MoreExperiences packages={[make("village", { category: "experience" }), make("minneriya", { category: "safari" })]} />
    )
    expect(html).toContain("/packages/village")
    expect(html).not.toContain("/packages/minneriya")
    expect(renderToStaticMarkup(<MoreExperiences packages={[make("minneriya", { category: "safari" })]} />)).toBe("")
  })
})
```

- [ ] **Step 3: Compose the homepage.** `app/(main)/page.tsx`:

```tsx
export default async function Home() {
  const packages = await getPackages()
  return (
    <main>
      <HeroSection />
      <ParkChooser packages={packages} />
      <RealGuests />
      <HowBookingWorks />
      <MoreExperiences packages={packages} />
      <FAQSection variant="safari" />
      <FeaturedBlogsSection />
      <FinalCta />
      <MobileContactBar />
    </main>
  )
}
```

Keep the existing `metadata` export. Delete the five replaced home components after `grep -rn` confirms no other importer. `components/home/featured-blogs-section.tsx` keeps working, with its `Link` + `Button` nesting fixed to `Button asChild` in this step.

- [ ] **Step 4: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

```bash
git add components/home "app/(main)/page.tsx"
git commit -m "feat: rebuild the homepage around parks, real guests and WhatsApp"
```

---

### Task 10: Book-now, contact and blog post

**Files:**
- Modify: `components/common/booking-form.tsx` (prop instead of `useSearchParams`; drop the `motion` wrapper)
- Create: `components/common/booking-form.test.tsx`
- Modify: `app/(main)/book-now/page.tsx`, `app/(main)/contact/page.tsx`, `app/(main)/blogs/[slug]/page.tsx`, `app/(main)/blogs/page.tsx` (add `MobileContactBar`)

**Interfaces:**
- Produces: `BookingForm({ packages, initialPackageId }: { packages: {_id: string; name: string}[]; initialPackageId?: string })`.

- [ ] **Step 1: Failing test.** Create `components/common/booking-form.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))

import BookingForm from "./booking-form"

const packages = [{ _id: "a".repeat(24), name: "Hurulu Eco Park Safari" }]

describe("BookingForm server render", () => {
  it("is visible before JavaScript runs", () => {
    expect(renderToStaticMarkup(<BookingForm packages={packages} />)).not.toMatch(/opacity:\s*0/)
  })

  it("renders its fields", () => {
    const html = renderToStaticMarkup(<BookingForm packages={packages} />)
    expect(html).toContain("Full Name")
    expect(html).toContain("Preferred Date")
  })

  it("preselects the package passed from the server", () => {
    const html = renderToStaticMarkup(<BookingForm packages={packages} initialPackageId={"a".repeat(24)} />)
    expect(html).toContain("Hurulu Eco Park Safari")
  })
})
```

Run: `pnpm test components/common/booking-form.test.tsx`
Expected: FAIL. `useSearchParams` isn't mocked (throws), and `opacity:0` is present.

- [ ] **Step 2: Implement.**

`booking-form.tsx`:
- Remove `useSearchParams` and the `motion` import.
- Accept `initialPackageId?: string` and use it as the `packageId` default (validated with `/^[a-f\d]{24}$/i`, else `""`).
- Replace `<motion.div …>` with `<div className="bg-white rounded-xl shadow-lg p-6 md:p-8">`.

`app/(main)/book-now/page.tsx`:
- Accept `{ searchParams }: { searchParams: Promise<{ packageId?: string }> }`, do `const { packageId } = await searchParams`, and pass `initialPackageId={packageId}`.
- Remove the `Suspense` wrapper.
- Above the form add a block: `<div className="mb-8 grid gap-3 rounded-lg border bg-card p-6"><h2 className="text-2xl">Fastest: message us on WhatsApp</h2><p className="text-muted-foreground">We reply within 24 hours with availability and the current price.</p><ContactActions /></div>`. The 24-hour promise is the site's existing one; don't strengthen it.
- Change the FAQ call to `<FAQSection variant="booking" />`.

`app/(main)/contact/page.tsx`: the `motion.div` becomes a `div`, drop the framer import, confirm the Task 3 `tel:` link, and add `<MobileContactBar />`.

`app/(main)/blogs/[slug]/page.tsx`: before `{/* Comments Section */}` insert `<FinalCta title="Planning a safari from Habarana?" />`. Add `<MobileContactBar />` at the end of `<article>`'s parent. Also add `<MobileContactBar />` to `app/(main)/blogs/page.tsx`.

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

- [ ] **Step 3: Commit.**

```bash
git add components/common/booking-form.tsx components/common/booking-form.test.tsx "app/(main)/book-now/page.tsx" "app/(main)/contact/page.tsx" "app/(main)/blogs/[slug]/page.tsx" "app/(main)/blogs/page.tsx"
git commit -m "feat: server-rendered inquiry form, WhatsApp-first contact and blog CTAs"
```

---

### Task 11: Landing copy drafts for the owner

**Files:**
- Create: `docs/content/package-landing-drafts.md`

- [ ] **Step 1: Write the drafts** for Minneriya, Kaudulla, Hurulu, the village experience and the cooking class. Each draft has every landing field in the exact admin format from Task 2: summary, seoTitle, seoDescription, groupSize, highlights, notIncluded, timeSlots, pickupAreas, whatToBring, itinerary (`time | title | detail`), FAQs (blocks) and season.
  - **Source only from existing site copy:** the live package descriptions, the five live blog posts, and the FAQ. Cite the source URL under each draft.
  - Where the sources contradict each other (season: "May–Oct" vs "Apr–Sep" vs "Aug–Dec"; herd size "200–300" vs "300–700"), don't pick one. Show both and mark **[confirm]**.
  - Every price, time slot, ticket inclusion and pickup area is marked **[confirm]**.
  - Also list the typo fixes for each package's `description` (from the audit) as before/after pairs.

- [ ] **Step 2: Commit.**

```bash
git add docs/content/package-landing-drafts.md
git commit -m "docs: draft landing-page copy for the five core packages"
```

---

### Task 12: Whole-branch verification

- [ ] **Step 1: Gates.**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
Expected: all green.

- [ ] **Step 2: HTML checks on `pnpm start`** (dev DB):

```bash
B=http://localhost:3000
PKG=$(curl -s $B/packages | grep -oE 'href="/packages/[a-z0-9-]+"' | head -1 | sed 's/href="//;s/"//')
curl -s $B/ | grep -c 'wa.me/94766675883'                                   # ≥ 3 (hero, bar, final CTA)
curl -s $B/ | grep -cE '<a[^>]*>\s*<button'                                 # 0
curl -s $B/ | grep -c 'opacity:0'                                           # 0
curl -s $B$PKG | grep -oE '<title>[^<]+</title>'                            # "… | Ceylon Safari"
curl -s $B$PKG | grep -c 'Price on request\|From US\$\|From LKR'             # ≥ 1
curl -s $B$PKG | grep -ciE 'free cancellation|instant confirmation'         # 0
curl -s "$B/book-now?packageId=$(curl -s $B$PKG | grep -oE 'packageId=[a-f0-9]{24}' | head -1 | cut -d= -f2)" | grep -c 'Loading form'  # 0
curl -s $B/definitely-missing | grep -oE '<meta name="robots"[^>]*>'        # exactly one noindex
grep -rn "umami\|posthog\|data-umami" app components lib config             # no output
```

- [ ] **Step 3: Visual check at 390 px and 1280 px.** Screenshot these in light theme:
  - `/`;
  - a package with no landing data;
  - a package after pasting one draft from Task 11 into the **dev** admin.

  Check:
  - the first screen shows the H1, trust line and WhatsApp;
  - the mobile bar doesn't cover the footer's last line;
  - there's no horizontal overflow;
  - the booking panel sticks on desktop;
  - the season strip is readable.

- [ ] **Step 4: Report** the evidence to the user. Hand the owner-facing items to the user: pasting drafts into the admin after confirming the facts, setting `category` and `sortOrder` on the live packages, and deleting the `explore-sri-lanka-…` package so Task 7's redirect applies.
