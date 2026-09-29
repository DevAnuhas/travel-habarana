# Landing Page Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage and every package page into conversion-first landing pages. On a 390×844 phone, the first viewport answers what, how long, how much and why trust, and a WhatsApp action is always within reach.

**Architecture:**
- Optional structured "landing" fields on the Mongo `Package` feed one server-rendered template, which renders a section only when its data exists.
- The serializer normalises data once: it infers a category when unset, cleans season months and drops empty values.
- All behaviour lives in pure modules under `lib/` with Vitest suites.
- Server components get `renderToStaticMarkup` tests.
- A dependency-free Chrome DevTools-protocol script verifies first-viewport facts, overflow and contact-bar clearance in a real browser.
- The existing brand tokens are extended, not replaced.

**Tech Stack:** Next.js 16 App Router (Cache Components), React 19, TypeScript 6, Tailwind 4, shadcn/Radix, Mongoose 9, Zod 4, react-hook-form, Vitest 5 (oxc transform, TZ=UTC), Node 26 (global `WebSocket`), pnpm 11.

**Spec:** `docs/superpowers/specs/2026-09-29-landing-page-revamp-design.md` (revision 1)

**Prerequisite:** `docs/superpowers/plans/2026-09-29-lead-recovery-fixes.md` Tasks 1–7 are complete. This plan consumes:
- `planSlugChange` / `previousSlugs`;
- `PACKAGE_CATEGORIES`, `PRICE_*`, `sortPackages`, `selectRelatedPackages`;
- `truncateAtWord`, `buildPackageTitle`;
- `getFaqs` / `FAQSection variant`;
- `contentRedirects`.

That plan's Tasks 8–11 are superseded, and analytics is dropped.

## Revision 1: response to review round 1

| # | Reviewer point | Change | Where |
|---|---|---|---|
| 1 | First viewport lacks decision facts | The homepage hero carries safari quick-pick rows (name, duration, price or "Price on request"), with no viewport-height hero. The package page drops the gallery to a 16:9 strip and puts price, trust, duration and WhatsApp right under the H1. `ContactActions compact` sits side by side on mobile. Real-browser first-viewport assertions at 390×844 cover the short and long names. | Tasks 3, 8, 9, 12 |
| 2 | No categories on live packages means an empty park chooser | `inferCategory(slug, name)`, applied in the serializer when `category` is null, is unit-tested against all 11 live slugs and the 5 dev slugs. The admin value wins. | Task 1 |
| 3 | 500–800 words not delivered | Content is now an explicit **release gate** that depends on owner edits. `scripts/landing-word-report.mjs` measures unique words per safari page. The drafts separate paste-ready text from owner questions. | Tasks 11, 12 |
| 4 | Fixed claims outside admin data | Pickup reads "Hotel pickup from", never "free". The hero and how-it-works copy describe only the process. Category intros are neutral. The private-jeep line is removed. `FinalCta` is generic with a per-page title. There's no "quieter" month label. | Tasks 5, 7, 8, 9 |
| 5 | `availability: InStock` asserted from price | Removed. A test asserts it's absent. | Task 4 |
| 6 | Breakpoint gap and spacer guess | The bar is `lg:hidden`, matching the navbar's `lg`, and uses **`position: sticky; bottom: 0`** as the last child of `<main>`, so no spacer is needed and it can't cover the footer. It's also added to `/book-now`. Browser checks cover 125% text. | Tasks 6, 10, 12 |
| 7 | Invalid season means an empty "When to go" | `normalizeSeason` runs in the serializer, and `WhenToGo` renders only when `buildSeasonCells` returns cells. Tests cover fully invalid and overlapping data. | Tasks 1, 2, 8 |
| 8 | Tests don't pin behaviour | `resolveInitialPackageId` is unit-tested, and the browser verifies the selected value. Footer clearance is checked in the browser. Gallery no-image markup is tested. Counts use `grep -o … \| wc -l`. | Tasks 8, 10, 12 |
| 9 | Contrast, alts, duplicate lead image | The WhatsApp token becomes `oklch(0.5 0.12 158)` (5.63:1) with a darker hover, and a contrast regression test parses `globals.css`. An `imageAlts` field is added. The gallery is **one** markup list, so the lead image is requested once, which the browser verifies. | Tasks 1, 3, 8, 12 |
| — | "Compact" experience cards | The spec now reuses `PackageCard`, which is DRY. | Task 9 |

## Global Constraints

- Formatting: `.prettierrc` (no semicolons, double quotes, 2 spaces). Tab-indented legacy files keep their style.
- One commit per task, with a direct message and **no AI attribution trailer**.
- **No analytics or tracking code of any kind** (PostHog is pending client approval).
- No new dependencies of any kind.
- Brand stays: logo files, `--primary` jeep green, `--secondary` dry grass, DM Serif Display (H1/H2) and Inter, `--radius: 0.25rem`.
- WhatsApp number `+94 76 667 5883` (`siteConfig.contact.phoneE164`). Canonical origin `https://www.ceylonsafari.com`.
- **Never invent or strengthen a business claim.**
  - Service facts (price, cancellation, times, pickup, private jeep, season, what's included) render only from that package's admin fields.
  - Fixed copy may describe only the booking process: message us; we reply within 24 hours, which is the site's existing promise; no payment is needed to ask.
  - No schema property asserts state that isn't in the data.
- Every section is complete in server HTML: no `opacity:0` mounts and no `<a>` wrapping `<button>`.
- Text on coloured buttons meets WCAG AA (≥ 4.5:1).
- Never write to production data. Local verification uses `travelHabaranaDB-Dev`.

## Review Focus

1. **Every live package today has no landing data and no category.** Pages must render complete, categorised and first-viewport-compliant. Pinned by the `inferCategory` live-slug test (Task 1), the omission tests (Task 8) and the browser checks (Task 12).
2. **Admin editing a list textarea.** Newlines must survive typing, and clearing must save `null`. Pinned by the parse tests (Task 2) and the manual step.
3. **Bad season data** (0, 13, duplicates, peak/good overlap) is rejected on save and normalised on read, so there's never an empty "When to go". Pinned in Tasks 1, 2 and 8.
4. **Contact bar vs footer and last content**, at 125% text and with a safe-area inset. Pinned by the browser clearance check (Task 12).
5. **Long or odd package names** (`&`, quotes, trailing spaces, the 54-character "Explore Sri Lanka…" title) in WhatsApp prefill, titles and the first viewport. Pinned in Tasks 3, 8 and 12.

---

### Task 1: Landing content fields, category inference, season normalisation

**Files:**
- Create: `lib/package-serialize.ts`, `lib/package-serialize.test.ts`, `lib/season.ts`, `lib/season.test.ts`
- Modify: `lib/package-catalog.ts` (+`inferCategory`), `lib/package-catalog.test.ts` (create if absent), `lib/types.ts`, `lib/types.test.ts`, `models/Package.ts`, `lib/packages.ts`

**Interfaces:**
- Consumes: lead-recovery Task 3 (merchandising fields, `superRefine` on `packageSchema`).
- Produces:
  - `interface ItineraryStep { time?: string; title: string; detail?: string }`, `interface PackageFaq { question: string; answer: string }`, `interface Season { peak: number[]; good: number[] }`
  - `normalizeSeason(season?: { peak?: number[] | null; good?: number[] | null } | null): Season | undefined`
  - `inferCategory(slug: string, name: string): PackageCategory | undefined`
  - `PublicPackage` gains `summary?`, `seoTitle?`, `seoDescription?`, `groupSize?`, `highlights?`, `notIncluded?`, `timeSlots?`, `pickupAreas?`, `whatToBring?`, `itinerary?`, `faqs?`, `season?`, `imageAlts?`. Each is `undefined` when unset or empty. `category` is the admin value, else inferred.
  - `serializePackage(doc: PackageDocument): PublicPackage` in the pure module `lib/package-serialize.ts`. `lib/packages.ts` re-exports `PublicPackage`.
  - `export type PackageInput = z.infer<typeof packageSchema>` from `lib/types.ts`.

- [ ] **Step 1: Failing tests, part 1 (schema).** Append to `lib/types.test.ts`:

```ts
describe("packageSchema landing fields", () => {
  const landing = {
    summary: "See the elephant gathering at Minneriya tank in a jeep with a local guide.",
    seoTitle: "Minneriya National Park Jeep Safari from Habarana",
    seoDescription: "Minneriya jeep safari from Habarana.",
    groupSize: "Up to 6 per jeep",
    highlights: ["Elephant herds at the tank"],
    notIncluded: ["Park entrance tickets"],
    timeSlots: ["6:00 am", "2:30 pm"],
    pickupAreas: ["Habarana", "Sigiriya"],
    whatToBring: ["Hat"],
    itinerary: [{ time: "2:30 pm", title: "Hotel pickup", detail: "In an open jeep" }],
    faqs: [{ question: "Is it private?", answer: "Yes, the jeep is only for your group." }],
    season: { peak: [8, 9], good: [7, 10] },
    imageAlts: ["Elephants at the Minneriya tank at sunset"],
  }

  it("accepts a full landing payload and keeps it", () => {
    const result = packageSchema.parse({ ...legacyPackage, ...landing })
    expect(result).toMatchObject(landing)
  })

  it("accepts null for every landing field", () => {
    const nulls = Object.fromEntries(Object.keys(landing).map((key) => [key, null]))
    expect(packageSchema.safeParse({ ...legacyPackage, ...nulls }).success).toBe(true)
  })

  it.each([
    ["too many highlights", { highlights: Array.from({ length: 9 }, (_, i) => `Highlight ${i}`) }],
    ["month 13", { season: { peak: [13], good: [] } }],
    ["month 0", { season: { peak: [], good: [0] } }],
    ["duplicate month", { season: { peak: [8, 8], good: [] } }],
    ["peak and good overlap", { season: { peak: [8], good: [8] } }],
    ["FAQ without answer", { faqs: [{ question: "Is it private?", answer: "" }] }],
    ["summary over 220 chars", { summary: "a".repeat(221) }],
    ["alt over 150 chars", { imageAlts: ["a".repeat(151)] }],
  ])("rejects %s", (_label, extra) => {
    expect(packageSchema.safeParse({ ...legacyPackage, ...extra }).success).toBe(false)
  })
})
```

Run: `pnpm test lib/types.test.ts`
Expected: FAIL. The "keeps it" case fails, since unknown keys are stripped, and most "rejects" cases pass parsing.

- [ ] **Step 2: Failing tests, part 2 (season, category, serializer).** Create `lib/season.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { normalizeSeason } from "./season"

describe("normalizeSeason", () => {
  it("returns undefined without usable months", () => {
    expect(normalizeSeason(undefined)).toBeUndefined()
    expect(normalizeSeason(null)).toBeUndefined()
    expect(normalizeSeason({ peak: [], good: [] })).toBeUndefined()
    expect(normalizeSeason({ peak: [0, 13, 8.5], good: [-1] })).toBeUndefined()
  })

  it("drops invalid and duplicate months, sorts, and lets peak win over good", () => {
    expect(normalizeSeason({ peak: [9, 8, 8, 13], good: [8, 7, 7] })).toEqual({ peak: [8, 9], good: [7] })
  })

  it("tolerates null arrays from legacy documents", () => {
    expect(normalizeSeason({ peak: null, good: [10] })).toEqual({ peak: [], good: [10] })
  })
})
```

Create or append `lib/package-catalog.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { inferCategory } from "./package-catalog"

describe("inferCategory", () => {
  // The 11 live slugs (www.ceylonsafari.com/packages, 29 Sep 2026) and the 5 dev slugs.
  it.each([
    ["hurulu-eco-park-safari", "safari"],
    ["minneriya-national-park-safari", "safari"],
    ["kaudulla-national-park-safari", "safari"],
    ["village-experience-tour", "experience"],
    ["sri-lankan-culinary-journey", "experience"],
    ["polonnaruwa-city-tours", "tour"],
    ["sigiriya-city-tours", "tour"],
    ["medirigiriya-vatadageya-tour", "tour"],
    ["srilankan-day-and-multi-day-tours", "tour"],
    ["explore-sri-lanka-a-complete-guide-to-every-city-tour", "tour"],
    ["habarana-cottages-and-rooms", "stay"],
  ])("%s → %s", (slug, expected) => {
    expect(inferCategory(slug, slug.replace(/-/g, " "))).toBe(expected)
  })

  it("uses the name when the slug says nothing", () => {
    expect(inferCategory("package-7", "Habarana Cooking Class")).toBe("experience")
  })

  it("returns undefined when nothing matches", () => {
    expect(inferCategory("misc", "Airport transfer")).toBeUndefined()
  })
})
```

Create `lib/package-serialize.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { serializePackage, type PackageDocument } from "./package-serialize"

const base: PackageDocument = {
  _id: "a".repeat(24),
  slug: "hurulu-eco-park-safari",
  name: "Hurulu Eco Park Safari ",
  description: "A jeep safari.",
  duration: "3 hours",
  included: ["Jeep"],
  images: ["https://res.cloudinary.com/demo/hurulu.jpg"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
}

describe("serializePackage", () => {
  it("keeps a legacy package intact, trims the name and infers its category", () => {
    const result = serializePackage(base)
    expect(result).toMatchObject({
      _id: "a".repeat(24),
      name: "Hurulu Eco Park Safari",
      category: "safari",
      createdAt: "2026-01-01T00:00:00.000Z",
    })
    expect(result.summary).toBeUndefined()
    expect(result.season).toBeUndefined()
  })

  it("prefers the admin category over the inferred one", () => {
    expect(serializePackage({ ...base, category: "tour" }).category).toBe("tour")
  })

  it("maps null, blank strings and empty lists to undefined", () => {
    const result = serializePackage({
      ...base,
      summary: "  ",
      highlights: [],
      faqs: null,
      season: { peak: [], good: [] },
      priceFrom: null,
      imageAlts: [],
    })
    expect(result.summary).toBeUndefined()
    expect(result.highlights).toBeUndefined()
    expect(result.faqs).toBeUndefined()
    expect(result.season).toBeUndefined()
    expect(result.priceFrom).toBeUndefined()
    expect(result.imageAlts).toBeUndefined()
  })

  it("normalises season and itinerary", () => {
    const result = serializePackage({
      ...base,
      itinerary: [{ time: null, title: " Pickup ", detail: null }],
      season: { peak: [8, 13], good: [8, 7] },
    })
    expect(result.itinerary).toEqual([{ title: "Pickup" }])
    expect(result.season).toEqual({ peak: [8], good: [7] })
  })
})
```

Run: `pnpm test lib/season.test.ts lib/package-catalog.test.ts lib/package-serialize.test.ts`
Expected: FAIL, missing exports and modules.

- [ ] **Step 3: Implement the schema.** In `lib/types.ts` add above `packageSchema`:

```ts
const optionalText = (maximum: number) =>
	z.string().trim().max(maximum).nullable().optional();

const listOf = (maxItems: number, maxLength: number, label: string) =>
	z.array(trimmedString(1, maxLength, label)).max(maxItems).nullable().optional();

const monthSchema = z.number().int().min(1).max(12);
```

add inside the `packageSchema` object:

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
	imageAlts: listOf(30, 150, "Image description"),
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

extend the existing `superRefine` body (keep the price checks) with:

```ts
	if (value.season) {
		const all = [...value.season.peak, ...value.season.good];
		if (new Set(all).size !== all.length) {
			context.addIssue({
				code: "custom",
				path: ["season"],
				message: "Each month can be marked once, as best or good",
			});
		}
	}
```

and export `export type PackageInput = z.infer<typeof packageSchema>;`.

- [ ] **Step 4: Implement the season, category and serializer modules.** Create `lib/season.ts`:

```ts
export interface Season {
  peak: number[]
  good: number[]
}

type RawSeason = { peak?: number[] | null; good?: number[] | null } | null | undefined

const isMonth = (value: number) => Number.isInteger(value) && value >= 1 && value <= 12
const sortedUnique = (values: Iterable<number>) => [...new Set(values)].sort((a, b) => a - b)

/** Clean legacy or hand-edited season data: valid unique months, peak wins over good. */
export function normalizeSeason(season: RawSeason): Season | undefined {
  const peak = sortedUnique((season?.peak ?? []).filter(isMonth))
  const good = sortedUnique((season?.good ?? []).filter((m) => isMonth(m) && !peak.includes(m)))
  return peak.length || good.length ? { peak, good } : undefined
}
```

Append to `lib/package-catalog.ts`:

```ts
// Explicit keyword fallback for packages whose admin category is unset
// (every live package as of 29 Sep 2026). Order matters: "village-experience-tour"
// must be an experience, not a tour. The admin's category always wins.
const CATEGORY_RULES: ReadonlyArray<readonly [RegExp, PackageCategory]> = [
  [/safari/, "safari"],
  [/village|cooking|culinary/, "experience"],
  [/cottage|room|stay|hotel/, "stay"],
  [/tour/, "tour"],
]

export function inferCategory(slug: string, name: string): PackageCategory | undefined {
  const haystack = `${slug} ${name}`.toLowerCase()
  return CATEGORY_RULES.find(([pattern]) => pattern.test(haystack))?.[1]
}
```

Create `lib/package-serialize.ts`. There's no `server-only` import; move `PublicPackage`, `PackageDocument` and `serializePackage` here from `lib/packages.ts`.

```ts
import {
  inferCategory,
  type PackageCategory,
  type PriceCurrency,
  type PriceUnit,
} from "@/lib/package-catalog"
import { normalizeSeason, type Season } from "@/lib/season"

export type { Season } from "@/lib/season"

export interface ItineraryStep {
  time?: string
  title: string
  detail?: string
}

export interface PackageFaq {
  question: string
  answer: string
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
  imageAlts?: string[]
  itinerary?: ItineraryStep[]
  faqs?: PackageFaq[]
  season?: Season
}

type Nullable<T> = { [K in keyof T]?: T[K] | null }

export interface PackageDocument
  extends Nullable<Omit<PublicPackage, "_id" | "createdAt" | "updatedAt" | "itinerary" | "season">> {
  _id: { toString(): string } | string
  slug: string
  name: string
  description: string
  duration: string
  included: string[]
  images?: string[] | null
  createdAt?: Date | null
  updatedAt?: Date | null
  previousSlugs?: string[] | null
  itinerary?: Array<{ time?: string | null; title: string; detail?: string | null }> | null
  season?: { peak?: number[] | null; good?: number[] | null } | null
}

const text = (value?: string | null) => value?.trim() || undefined
const list = <T>(value?: T[] | null) => (value && value.length > 0 ? value : undefined)

export function serializePackage(doc: PackageDocument): PublicPackage {
  const itinerary = list(doc.itinerary)?.map((step) => ({
    title: step.title.trim(),
    ...(text(step.time) ? { time: text(step.time) } : {}),
    ...(text(step.detail) ? { detail: text(step.detail) } : {}),
  }))

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
    category: doc.category ?? inferCategory(doc.slug, doc.name),
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
    imageAlts: list(doc.imageAlts),
    itinerary,
    faqs: list(doc.faqs),
    season: normalizeSeason(doc.season),
  }
}
```

`lib/packages.ts`: delete the moved interfaces and function, then import `serializePackage` and `PackageDocument` from `@/lib/package-serialize` and add `export type { PublicPackage } from "@/lib/package-serialize";`.

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
		imageAlts: { type: [String], default: undefined },
		itinerary: {
			type: [
				new mongoose.Schema(
					{ time: String, title: { type: String, required: true }, detail: String },
					{ _id: false }
				),
			],
			default: undefined,
		},
		faqs: {
			type: [
				new mongoose.Schema(
					{ question: { type: String, required: true }, answer: { type: String, required: true } },
					{ _id: false }
				),
			],
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
git add lib/package-serialize.ts lib/package-serialize.test.ts lib/season.ts lib/season.test.ts lib/package-catalog.ts lib/package-catalog.test.ts lib/types.ts lib/types.test.ts models/Package.ts lib/packages.ts
git commit -m "feat: add landing-page fields, category inference, and season normalisation"
```

---

### Task 2: Admin editing for landing content

**Files:**
- Create: `lib/package-landing.ts`, `lib/package-landing.test.ts`
- Modify: `lib/season.ts` (+`buildSeasonCells`, `cycleMonth`, `describeSeason`, month labels), `lib/season.test.ts`
- Create: `components/admin/lines-textarea.tsx`, `components/admin/season-picker.tsx`, `components/admin/package-landing-fields.tsx`
- Modify: `app/admin/(dashboard)/packages/page.tsx`

**Interfaces:**
- Produces:
  - `parseLines`, `formatLines`, `parseItinerary`, `formatItinerary`, `parseFaqs` (→ `{ faqs, dropped }`), `formatFaqs`, `splitParagraphs`
  - `MONTH_LABELS`, `MONTH_INITIALS`, `type SeasonLevel = "peak" | "good" | "off"`, `SeasonCell`
  - `buildSeasonCells(season?: Season | null): SeasonCell[] | null` (applies `normalizeSeason`)
  - `cycleMonth(season: Season | null | undefined, month: number): Season | null`
  - `describeSeason(season?: Season | null): string | null`

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
    expect(
      parseFaqs("Is it private?\nYes, only your group.\n\nDo you pick up?\nYes, from Habarana.\nAnd Sigiriya.")
    ).toEqual({
      faqs: [
        { question: "Is it private?", answer: "Yes, only your group." },
        { question: "Do you pick up?", answer: "Yes, from Habarana. And Sigiriya." },
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
  expect(splitParagraphs("One\nline.\n\n\nTwo  here.\n")).toEqual(["One line.", "Two here."])
})
```

Append to `lib/season.test.ts`:

```ts
import { buildSeasonCells, cycleMonth, describeSeason } from "./season"

describe("buildSeasonCells", () => {
  it("returns null without usable data", () => {
    expect(buildSeasonCells(undefined)).toBeNull()
    expect(buildSeasonCells({ peak: [0, 13], good: [] })).toBeNull()
  })

  it("marks 12 months, peak winning over good", () => {
    const cells = buildSeasonCells({ peak: [8, 9], good: [7, 10, 8] })!
    expect(cells).toHaveLength(12)
    expect(cells.map((c) => c.level).join(",")).toBe("off,off,off,off,off,off,good,peak,peak,good,off,off")
    expect(cells[0]).toMatchObject({ month: 1, label: "Jan", initial: "J" })
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
  it("summarises runs of months", () => {
    expect(describeSeason({ peak: [7, 8, 9], good: [6, 10, 12] })).toBe("Best: Jul–Sep. Good: Jun, Oct, Dec.")
  })

  it("returns null without data", () => {
    expect(describeSeason(undefined)).toBeNull()
  })
})
```

Run: `pnpm test lib/package-landing.test.ts lib/season.test.ts`
Expected: FAIL, missing exports.

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
    return { ...(first ? { time: first } : {}), title: second, ...(detail ? { detail } : {}) }
  })
}

export function formatItinerary(steps?: readonly ItineraryStep[] | null): string {
  return (steps ?? [])
    .map(({ time, title, detail }) =>
      !time && !detail ? title : [time ?? "", title, ...(detail ? [detail] : [])].join(" | ")
    )
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

Append to `lib/season.ts`:

```ts
export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const
export const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const

export type SeasonLevel = "peak" | "good" | "off"

export interface SeasonCell {
  month: number
  label: string
  initial: string
  level: SeasonLevel
}

export function buildSeasonCells(season?: Season | null): SeasonCell[] | null {
  const clean = normalizeSeason(season)
  if (!clean) return null
  return MONTH_LABELS.map((label, index) => {
    const month = index + 1
    const level: SeasonLevel = clean.peak.includes(month) ? "peak" : clean.good.includes(month) ? "good" : "off"
    return { month, label, initial: MONTH_INITIALS[index], level }
  })
}

/** Admin picker: off → good → peak → off. Returns null when nothing is marked. */
export function cycleMonth(season: Season | null | undefined, month: number): Season | null {
  const clean = normalizeSeason(season) ?? { peak: [], good: [] }
  const peak = new Set(clean.peak)
  const good = new Set(clean.good)
  if (peak.has(month)) peak.delete(month)
  else if (good.has(month)) {
    good.delete(month)
    peak.add(month)
  } else good.add(month)
  return normalizeSeason({ peak: [...peak], good: [...good] }) ?? null
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
  const clean = normalizeSeason(season)
  if (!clean) return null
  const parts: string[] = []
  if (clean.peak.length) parts.push(`Best: ${describeRuns(clean.peak)}.`)
  if (clean.good.length) parts.push(`Good: ${describeRuns(clean.good)}.`)
  return parts.join(" ")
}
```

Run: `pnpm test lib/package-landing.test.ts lib/season.test.ts`
Expected: PASS.

- [ ] **Step 3: Admin components.**

Create `components/admin/lines-textarea.tsx`. It keeps the raw text in local state, so a typed newline is never reformatted mid-edit. It pushes the parsed value up on every change, and `null` when empty.

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
}

export function LinesTextarea<T>({ id, value, format, parse, isEmpty, onChange, placeholder, rows = 4 }: LinesTextareaProps<T>) {
  const [text, setText] = useState(() => format(value))
  return (
    <Textarea
      id={id}
      rows={rows}
      value={text}
      placeholder={placeholder}
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

import { buildSeasonCells, cycleMonth, MONTH_INITIALS, MONTH_LABELS, type Season } from "@/lib/season"
import { cn } from "@/lib/utils"

const LEVEL_STYLE = {
  off: "border-border bg-background text-muted-foreground",
  good: "border-secondary bg-secondary/40 text-foreground",
  peak: "border-primary bg-primary text-primary-foreground",
} as const

export function SeasonPicker({ value, onChange }: { value: Season | null | undefined; onChange: (value: Season | null) => void }) {
  const cells =
    buildSeasonCells(value) ??
    MONTH_LABELS.map((label, index) => ({ month: index + 1, label, initial: MONTH_INITIALS[index], level: "off" as const }))

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12" role="group" aria-label="Best months">
      {cells.map((cell) => (
        <button
          key={cell.month}
          type="button"
          onClick={() => onChange(cycleMonth(value, cell.month))}
          aria-label={`${cell.label}: ${cell.level === "off" ? "not marked" : cell.level === "peak" ? "best" : "good"}`}
          className={cn("rounded border px-1 py-2 text-xs font-medium", LEVEL_STYLE[cell.level])}
        >
          {cell.label}
        </button>
      ))}
    </div>
  )
}
```

Create `components/admin/package-landing-fields.tsx`:

```tsx
"use client"

import { useState } from "react"
import type { Control } from "react-hook-form"

import { LinesTextarea } from "@/components/admin/lines-textarea"
import { SeasonPicker } from "@/components/admin/season-picker"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatFaqs, formatItinerary, formatLines, parseFaqs, parseItinerary, parseLines } from "@/lib/package-landing"
import type { PackageInput } from "@/lib/types"

type TextKey = "summary" | "seoTitle" | "seoDescription" | "groupSize"
type ListKey = "highlights" | "notIncluded" | "timeSlots" | "pickupAreas" | "whatToBring" | "imageAlts"

const TEXT_FIELDS: Array<{ name: TextKey; label: string; hint: string; multiline?: boolean; placeholder: string }> = [
  { name: "summary", label: "Summary", hint: "Shown on cards and under the page title. Up to 220 characters.", multiline: true, placeholder: "See the elephant gathering at Minneriya tank with a local guide." },
  { name: "groupSize", label: "Group size", hint: "Shown as a fact chip. Only write what you offer.", placeholder: "Up to 6 per jeep" },
  { name: "seoTitle", label: "Search title", hint: "Up to 70 characters. The brand is added automatically.", placeholder: "Minneriya National Park Jeep Safari from Habarana" },
  { name: "seoDescription", label: "Search description", hint: "Up to 160 characters. Leave blank to use the summary.", multiline: true, placeholder: "Minneriya jeep safari from Habarana with a local guide." },
]

const LIST_FIELDS: Array<{ name: ListKey; label: string; hint: string; placeholder: string }> = [
  { name: "highlights", label: "Highlights", hint: "One per line.", placeholder: "Elephant herds at the Minneriya tank" },
  { name: "notIncluded", label: "Not included", hint: "One per line.", placeholder: "Park entrance tickets" },
  { name: "timeSlots", label: "Start times", hint: "One per line.", placeholder: "6:00 am" },
  { name: "pickupAreas", label: "Hotel pickup areas", hint: "One per line. Shown as 'Hotel pickup from…'. Mention any charge in the price note.", placeholder: "Habarana" },
  { name: "whatToBring", label: "What to bring", hint: "One per line.", placeholder: "Hat and sunscreen" },
  { name: "imageAlts", label: "Photo descriptions", hint: "One per photo, in the same order as the images. Describe what the photo shows.", placeholder: "Elephants drinking at the Minneriya tank" },
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
              <FormDescription>{config.hint}</FormDescription>
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

- [ ] **Step 4: Wire the tab.** In `app/admin/(dashboard)/packages/page.tsx`:
1. Switch the form type to `PackageInput`.
2. Add `<TabsTrigger value="landing">Landing page</TabsTrigger>` after "Included".
3. Render `<PackageLandingFields key={editingPackage?._id ?? "new"} control={form.control} />` when `activeTab === "landing"`. The `key` resets the textareas' local text per package.
4. Add the 13 landing keys to the `Package` type, both `form.reset(...)` calls and `defaultValues` (as `editingPackage.x ?? null`, or `null`), extending `emptyMerchandising` into `emptyOptionalFields`.
5. Add them to the `JSON.stringify` body as `x: data.x ?? null`.
6. The Included tab's "Next" goes to `landing`; the landing tab gets Previous/Save.

- [ ] **Step 5: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean, with the pre-existing `react-hooks/immutability` warning only.

Manual check (`pnpm dev`, dev DB, admin login):
- The newline stays while typing.
- `2:30 pm | Pickup | Open jeep` persists.
- An FAQ with no answer shows the warning.
- Clicking Aug twice makes it "best".
- Clearing highlights makes the field empty after reopening.

```bash
git add lib/package-landing.ts lib/package-landing.test.ts lib/season.ts lib/season.test.ts components/admin "app/admin/(dashboard)/packages/page.tsx"
git commit -m "feat: edit landing-page content for packages in the admin"
```

---

### Task 3: Contact primitives, trust line, accessible WhatsApp colour

**Files:**
- Create: `lib/contact-links.ts`, `lib/contact-links.test.ts`, `components/common/contact-actions.tsx`, `components/common/contact-actions.test.tsx`, `components/common/trust-line.tsx`, `components/common/trust-line.test.tsx`, `config/imagery.ts`, `app/theme-contrast.test.ts`
- Modify: `app/globals.css`, `components/ui/button.tsx`, `config/site.ts`
- Modify every `siteConfig.links.whatsapp` user: `components/ui/whatsapp-button.tsx`, `components/layout/footer.tsx`, `components/home/hero-section.tsx`, `app/(main)/contact/page.tsx`, `app/(main)/thank-you/page.tsx`

**Interfaces:**
- Produces:
  - `buildWhatsAppUrl(options?: { packageName?: string }): string`, `TEL_HREF: string`
  - `<ContactActions packageName? compact? stacked? className? />`
    - `compact`: short labels "WhatsApp" / "Call", side by side at every width, full accessible names via `aria-label`.
  - `<TrustLine tone?: "light" | "dark"; className? />`, which renders `data-trust`
  - `siteConfig.reviews`, `imagery`
  - Tailwind `bg-whatsapp`, `hover:bg-whatsapp-hover`, `text-whatsapp-foreground`, `bg-surface-sunken`

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
    expect(messageOf(buildWhatsAppUrl({ packageName: "  " }))).toContain("I'd like to ask about a safari.")
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

  it("compact mode keeps full accessible names with short labels", () => {
    const compact = renderToStaticMarkup(<ContactActions compact />)
    expect(compact).toContain('aria-label="Ask on WhatsApp"')
    expect(compact).toContain('aria-label="Call +94 76 667 5883"')
    expect(compact).not.toContain(">Ask on WhatsApp<")
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

it("shows the Google rating and review count, links to the listing, and is findable by checks", () => {
  const html = renderToStaticMarkup(<TrustLine />)
  expect(html).toContain("5.0")
  expect(html).toContain("27 Google reviews")
  expect(html).toContain('href="https://maps.app.goo.gl/jtjd3mUANDnH3rRu5"')
  expect(html).toContain("data-trust")
})
```

Create `app/theme-contrast.test.ts`. It pins AA contrast for button text by reading the real tokens from `globals.css`.

```ts
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8")

function token(block: ":root" | ".dark", name: string): [number, number, number] {
  const body = css.match(new RegExp(`${block.replace(".", "\\.")}\\s*\\{([^}]*)\\}`))?.[1] ?? ""
  const match = body.match(new RegExp(`--${name}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`))
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

const ratio = (x: number, y: number) => (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)

describe("WhatsApp button text contrast (WCAG AA, 4.5:1)", () => {
  it.each([":root", ".dark"] as const)("%s", (block) => {
    const text = luminance(token(block, "whatsapp-foreground"))
    expect(ratio(text, luminance(token(block, "whatsapp")))).toBeGreaterThanOrEqual(4.5)
    expect(ratio(text, luminance(token(block, "whatsapp-hover")))).toBeGreaterThanOrEqual(4.5)
  })
})
```

Run: `pnpm test lib/contact-links.test.ts components/common app/theme-contrast.test.ts`
Expected: FAIL, missing modules and tokens.

- [ ] **Step 2: Implement.** Create `lib/contact-links.ts`:

```ts
import { siteConfig } from "@/config/site"

const WHATSAPP_NUMBER = siteConfig.contact.phoneE164.replace(/^\+/, "")

export const TEL_HREF = `tel:${siteConfig.contact.phoneE164}`

export function buildWhatsAppUrl({ packageName }: { packageName?: string } = {}): string {
  const name = packageName?.trim()
  const subject = name ? `I'd like to check availability for "${name}".` : "I'd like to ask about a safari."
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
  guests: [
    { src: cloudinary("v1747400857/IMG_8961_ntttrb.jpg"), alt: "Guests smiling in a safari jeep" },
    { src: cloudinary("v1747400887/IMG_0422_g3orcr.jpg"), alt: "A group of guests standing up in an open jeep" },
    { src: cloudinary("v1747400905/IMG_8953_rirwyz.jpg"), alt: "Guests photographing wildlife from the jeep" },
    { src: cloudinary("v1747225191/cover_yulgqs.jpg"), alt: "Safari jeeps lined up on a park track" },
  ],
} as const
```

`app/globals.css`:
- In `@theme inline` add `--color-whatsapp: var(--whatsapp); --color-whatsapp-hover: var(--whatsapp-hover); --color-whatsapp-foreground: var(--whatsapp-foreground); --color-surface-sunken: var(--surface-sunken);`.
- In `:root` **and** `.dark` add:

```css
	--whatsapp: oklch(0.5 0.12 158);
	--whatsapp-hover: oklch(0.44 0.1 160);
	--whatsapp-foreground: oklch(0.99 0 0);
```

- Add `--surface-sunken: oklch(0.935 0.012 100);` in `:root` and `--surface-sunken: oklch(0.19 0.03 125);` in `.dark`.
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

`components/ui/button.tsx`: add the variant

```ts
				whatsapp:
					"bg-whatsapp text-whatsapp-foreground shadow-xs hover:bg-whatsapp-hover",
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
  /** Short labels, side by side at every width (first-viewport use). */
  compact?: boolean
  /** Full-width buttons stacked at every width (booking panel). */
  stacked?: boolean
  className?: string
}

export function ContactActions({ packageName, compact = false, stacked = false, className }: ContactActionsProps) {
  const whatsappName = "Ask on WhatsApp"
  const callName = `Call ${siteConfig.contact.phone}`

  return (
    <div
      className={cn(
        "flex gap-3",
        compact ? "flex-row" : stacked ? "flex-col" : "flex-col sm:flex-row",
        className
      )}
    >
      <Button asChild size="lg" variant="whatsapp" className={cn(compact ? "flex-1" : "w-full sm:w-auto", stacked && "sm:w-full")}>
        <a
          href={buildWhatsAppUrl({ packageName })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={compact ? whatsappName : undefined}
        >
          <WhatsappLogo weight="fill" className="size-5" aria-hidden="true" />
          {compact ? "WhatsApp" : whatsappName}
        </a>
      </Button>
      <Button asChild size="lg" variant="outline" className={cn(compact ? "flex-1" : "w-full sm:w-auto", stacked && "sm:w-full")}>
        <a href={TEL_HREF} aria-label={compact ? callName : undefined}>
          <Phone className="size-5" aria-hidden="true" />
          {compact ? "Call" : callName}
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
      data-trust
      className={cn(
        "inline-flex w-fit items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline",
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

Replace each `siteConfig.links.whatsapp` with `buildWhatsAppUrl()`; `pnpm typecheck` lists every remaining use. On the contact page, the plain phone number becomes `<a href={TEL_HREF}>`.

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

- [ ] **Step 3: Commit.**

```bash
git add lib/contact-links.ts lib/contact-links.test.ts components/common/contact-actions.tsx components/common/contact-actions.test.tsx components/common/trust-line.tsx components/common/trust-line.test.tsx config/imagery.ts config/site.ts app/globals.css app/theme-contrast.test.ts components/ui/button.tsx components/ui/whatsapp-button.tsx components/layout/footer.tsx components/home/hero-section.tsx "app/(main)/contact/page.tsx" "app/(main)/thank-you/page.tsx"
git commit -m "feat: add WhatsApp and call primitives, trust line, and accessible brand tokens"
```

---

### Task 4: Pricing and Offer schema

**Files:**
- Create: `lib/pricing.ts`, `lib/pricing.test.ts`
- Modify: `app/(main)/packages/[id]/page.tsx` (`offers`)

**Interfaces:**
- Produces: `PriceFields`, `formatPrice(price: PriceFields): string | null`, `PRICE_ON_REQUEST = "Price on request"`, `buildOffer(price: PriceFields, url: string): Record<string, unknown> | undefined`.

- [ ] **Step 1: Failing test.** Create `lib/pricing.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildOffer, formatPrice } from "./pricing"

describe("formatPrice", () => {
  it("formats USD per jeep", () => {
    expect(formatPrice({ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" })).toBe("From US$45 per jeep")
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
  const price = { priceFrom: 45, priceCurrency: "USD" as const, priceUnit: "per jeep" as const }

  it("builds a schema.org Offer from price data", () => {
    expect(buildOffer(price, url)).toEqual({
      "@type": "Offer",
      price: 45,
      priceCurrency: "USD",
      url,
      description: "From US$45 per jeep",
    })
  })

  it("never asserts availability, because price does not establish it", () => {
    expect(buildOffer(price, url)).not.toHaveProperty("availability")
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

/** Offer from price data only. No availability: nothing in the data establishes it. */
export function buildOffer(price: PriceFields, url: string): Record<string, unknown> | undefined {
  const label = formatPrice(price)
  if (!label) return undefined
  return { "@type": "Offer", price: price.priceFrom, priceCurrency: price.priceCurrency, url, description: label }
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
- Produces: `<SeasonStrip season?; size?: "sm" | "md"; className? />`, which renders `null` without usable data.

- [ ] **Step 1: Failing test.** Create `components/packages/season-strip.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SeasonStrip } from "./season-strip"

describe("SeasonStrip", () => {
  it("renders nothing without usable season data", () => {
    expect(renderToStaticMarkup(<SeasonStrip />)).toBe("")
    expect(renderToStaticMarkup(<SeasonStrip season={{ peak: [0, 13], good: [] }} />)).toBe("")
  })

  it("renders 12 months with an accessible summary", () => {
    const html = renderToStaticMarkup(<SeasonStrip season={{ peak: [8, 9], good: [7] }} />)
    expect(html.match(/data-level=/g)).toHaveLength(12)
    expect(html.match(/data-level="peak"/g)).toHaveLength(2)
    expect(html).toContain('aria-label="Best: Aug–Sep. Good: Jul."')
  })

  it("labels unmarked months without a judgement", () => {
    const html = renderToStaticMarkup(<SeasonStrip season={{ peak: [8], good: [] }} />)
    expect(html).toContain('title="Jan"')
    expect(html).not.toMatch(/quiet|low season|avoid/i)
  })
})
```

Run: `pnpm test components/packages/season-strip.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement.** Create `components/packages/season-strip.tsx`:

```tsx
import { buildSeasonCells, describeSeason, type Season } from "@/lib/season"
import { cn } from "@/lib/utils"

const LEVEL = {
  peak: "bg-primary text-primary-foreground",
  good: "bg-secondary text-secondary-foreground",
  off: "bg-surface-sunken text-muted-foreground",
} as const

const TITLE = { peak: (m: string) => `${m}: best`, good: (m: string) => `${m}: good`, off: (m: string) => m }

export function SeasonStrip({ season, size = "md", className }: { season?: Season; size?: "sm" | "md"; className?: string }) {
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
            title={TITLE[cell.level](cell.label)}
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

### Task 6: Chrome: sticky contact bar, navbar, layout, browser-check tool

**Files:**
- Create: `components/common/mobile-contact-bar.tsx`, `components/common/mobile-contact-bar.test.tsx`, `scripts/verify-layout.mjs`
- Modify: `components/layout/navbar.tsx`, `app/(main)/layout.tsx`
- Delete: `components/ui/whatsapp-button.tsx`

**Interfaces:**
- Consumes: `buildWhatsAppUrl`, `TEL_HREF`, `formatPrice`, `PRICE_ON_REQUEST`.
- Produces:
  - `<MobileContactBar packageName? price?: PriceFields />`. It **must be the last child** of the page's outermost content element (`<main>`), since sticky positioning is scoped to that container.
  - `node scripts/verify-layout.mjs <baseUrl> <path[:facts]>...`, exiting non-zero on failure.

- [ ] **Step 1: Failing test.** Create `components/common/mobile-contact-bar.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { MobileContactBar } from "./mobile-contact-bar"

describe("MobileContactBar", () => {
  const html = renderToStaticMarkup(<MobileContactBar />)

  it("is sticky in normal flow (never fixed), so it settles above the footer", () => {
    expect(html).toContain("sticky")
    expect(html).toContain("bottom-0")
    expect(html).not.toMatch(/\bfixed\b/)
  })

  it("shows below the navbar breakpoint only and pads for the safe area", () => {
    expect(html).toContain("lg:hidden")
    expect(html).toContain("env(safe-area-inset-bottom")
    expect(html).toContain("data-contact-bar")
  })

  it("shows the price and prefills the package when given", () => {
    const withPrice = renderToStaticMarkup(
      <MobileContactBar packageName="Minneriya Safari" price={{ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }} />
    )
    expect(withPrice).toContain("From US$45 per jeep")
    expect(withPrice).toContain("data-price")
    expect(withPrice).toContain(encodeURIComponent("Minneriya Safari"))
  })

  it("says price on request for a package without a price", () => {
    expect(renderToStaticMarkup(<MobileContactBar packageName="Village Tour" price={{}} />)).toContain("Price on request")
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

/**
 * Sticky, not fixed: as the last child of <main> it rides the viewport bottom
 * while scrolling and settles into its own space above the footer at the end,
 * so it can never cover the footer or the last content, whatever its height.
 */
export function MobileContactBar({ packageName, price }: { packageName?: string; price?: PriceFields }) {
  const priceLabel = price ? (formatPrice(price) ?? PRICE_ON_REQUEST) : null

  return (
    <div
      data-contact-bar
      className="sticky bottom-0 z-40 border-t bg-background/95 px-4 pt-3 backdrop-blur lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center gap-3">
        {priceLabel && (
          <p data-price className="min-w-0 flex-1 text-sm leading-tight font-semibold">
            {priceLabel}
          </p>
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
        <a href={TEL_HREF} aria-label="Call us" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-4")}>
          <Phone className="size-5" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
```

Run: `pnpm test components/common/mobile-contact-bar.test.tsx`
Expected: PASS.

- [ ] **Step 3: Navbar and layout.**

`components/layout/navbar.tsx`:
- Desktop (`hidden lg:flex`): replace the "Send Inquiry" `Button` with `<Button asChild variant="whatsapp" className="ml-4"><a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer"><WhatsappLogo weight="fill" /> WhatsApp us</a></Button>`.
- Mobile: wrap the menu button in `<div className="flex items-center gap-4 lg:hidden">`, put `<a href={TEL_HREF} aria-label={`Call ${siteConfig.name}`} className="text-2xl"><Phone className="text-current" /></a>` before it, and drop `lg:hidden` from the button itself.
- In the mobile menu, replace "Send Inquiry" with two stacked buttons: WhatsApp (`variant="whatsapp"`) and `<Button asChild variant="outline"><Link href="/book-now">Send an inquiry form</Link></Button>`.

`app/(main)/layout.tsx`: remove `WhatsAppButton`, and change the outer `<main className="flex-grow">` to `<div className="flex-grow">`. Delete `components/ui/whatsapp-button.tsx`.

- [ ] **Step 4: Browser-check tool.** Create `scripts/verify-layout.mjs`. It uses no dependencies: Chrome DevTools Protocol via Node's global `WebSocket` and `fetch`.

```js
#!/usr/bin/env node
// Real-browser layout checks for conversion surfaces.
//   node scripts/verify-layout.mjs http://localhost:3000 "/:facts" "/packages/x:facts" /contact
// ":facts" also asserts duration + price in the first mobile viewport.
// Exits 1 on any failure. CHROME_PATH overrides the Chrome binary.
import { spawn } from "node:child_process"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
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
  ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--disable-gpu", `--user-data-dir=${mkdtempSync(join(tmpdir(), "vl-"))}`, "about:blank"],
  { stdio: "ignore" }
)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function pageSocketUrl() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const page = list.find((target) => target.type === "page")
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error("Chrome did not start")
}

const ws = new WebSocket(await pageSocketUrl())
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }))
let nextId = 0
const pending = new Map()
const listeners = new Set()
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    message.error ? reject(new Error(message.error.message)) : resolve(message.result)
  } else for (const listener of listeners) listener(message)
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value

await send("Page.enable")
await send("Network.enable")

async function load(url, viewport) {
  await send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 2, mobile: viewport.mobile })
  const images = []
  const onRequest = (m) => m.method === "Network.requestWillBeSent" && m.params.type === "Image" && images.push(m.params.request.url)
  listeners.add(onRequest)
  const loaded = new Promise((resolve) => {
    const onLoad = (m) => m.method === "Page.loadEventFired" && (listeners.delete(onLoad), resolve())
    listeners.add(onLoad)
  })
  await send("Page.navigate", { url })
  await loaded
  await sleep(1500)
  listeners.delete(onRequest)
  return images
}

// Visible = on screen AND not covered (hit-test at the element's centre).
const IN_PAGE = String.raw`
  const shown = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height || r.bottom <= 0 || r.top >= innerHeight) return false
    const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, r.top + r.height / 2))
    return hit === el || el.contains(hit) || hit?.contains(el)
  }
  const anyShown = (selector) => [...document.querySelectorAll(selector)].some(shown)
`

const firstViewport = () =>
  evaluate(`(() => { ${IN_PAGE} scrollTo(0, 0); return {
    h1: anyShown("h1"),
    trust: anyShown("[data-trust]"),
    whatsapp: anyShown('a[href^="https://wa.me/"]'),
    duration: anyShown("[data-fact=duration]"),
    price: anyShown("[data-price]"),
    overflowX: document.documentElement.scrollWidth - innerWidth,
  } })()`)

const endOfPage = () =>
  evaluate(`(async () => { ${IN_PAGE}
    scrollTo(0, document.documentElement.scrollHeight); await new Promise((r) => setTimeout(r, 300))
    const links = document.querySelectorAll("footer a")
    const bar = document.querySelector("[data-contact-bar]")
    const footer = document.querySelector("footer")
    const before = bar?.previousElementSibling
    return {
      lastFooterLinkShown: shown(links[links.length - 1]),
      barAboveFooter: !bar || !footer || getComputedStyle(bar).display === "none" || bar.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1,
      contentAboveBar: !bar || !before || getComputedStyle(bar).display === "none" || before.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top + 1,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    } })()`)

const selectedPackage = () => evaluate(`document.querySelector("[data-slot=select-trigger]")?.textContent?.trim() ?? null`)

const failures = []
const check = (label, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail !== undefined ? `  ${JSON.stringify(detail)}` : ""}`)
  if (!ok) failures.push(label)
}

for (const target of targets) {
  const [path, flags = ""] = target.split(/:(?=facts$)/)
  const wantFacts = flags === "facts"
  for (const viewport of VIEWPORTS) {
    const images = await load(new URL(path, base).toString(), viewport)
    const tag = `${path} @${viewport.name}`
    const first = await firstViewport()
    check(`${tag} no horizontal overflow`, first.overflowX <= 0, first.overflowX)
    check(`${tag} WhatsApp reachable`, first.whatsapp)
    if (viewport.name === "phone") {
      check(`${tag} H1 in first viewport`, first.h1)
      if (wantFacts) {
        check(`${tag} trust in first viewport`, first.trust)
        check(`${tag} duration in first viewport`, first.duration)
        check(`${tag} price in first viewport`, first.price)
      }
      const lead = await evaluate(`document.querySelector("[data-lead-image] img, img[data-lead-image]")?.currentSrc ?? null`)
      if (lead) {
        const leadKey = decodeURIComponent(new URL(lead).searchParams.get("url") ?? lead)
        const hits = images.filter((u) => decodeURIComponent(u).includes(leadKey)).length
        check(`${tag} lead image requested once`, hits === 1, { hits, totalImageRequests: images.length })
      }
      if (path.startsWith("/book-now?packageId=")) {
        const selected = await selectedPackage()
        check(`${tag} package preselected`, !!selected && selected !== "Select a package", selected)
      }
    }
    for (const zoom of ["100%", "125%"]) {
      await evaluate(`document.documentElement.style.fontSize = "${zoom}"`)
      const end = await endOfPage()
      check(`${tag} text ${zoom}: footer's last link not covered`, end.lastFooterLinkShown)
      check(`${tag} text ${zoom}: bar sits above footer`, end.barAboveFooter)
      check(`${tag} text ${zoom}: content above bar`, end.contentAboveBar)
      check(`${tag} text ${zoom}: no horizontal overflow`, end.overflowX <= 0, end.overflowX)
    }
    await evaluate(`document.documentElement.style.fontSize = ""`)
  }
}

ws.close()
chrome.kill()
console.log(failures.length ? `\n${failures.length} check(s) failed` : "\nall checks passed")
process.exit(failures.length ? 1 : 0)
```

- [ ] **Step 5: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint && grep -rn "whatsapp-button" app components`
Expected: PASS / clean / no grep output.

With `pnpm dev` running: `node scripts/verify-layout.mjs http://localhost:3000 /privacy`
Expected: the script launches Chrome, prints PASS/FAIL lines for every viewport and zoom, and exits.
- This is a tool smoke test. Overflow and footer checks should PASS.
- "WhatsApp reachable" at phone and tablet may FAIL, because `/privacy` has no contact bar. That's accepted: it proves the check can fail.
- The bar is exercised for real in Tasks 8–10 and 12.

```bash
git add components/common/mobile-contact-bar.tsx components/common/mobile-contact-bar.test.tsx components/layout/navbar.tsx "app/(main)/layout.tsx" components/ui/whatsapp-button.tsx scripts/verify-layout.mjs
git commit -m "feat: sticky mobile contact bar, WhatsApp-first navigation, and layout checks"
```

---

### Task 7: Package card and grouped listing

**Files:**
- Modify: `lib/package-catalog.ts` (+`CATEGORY_SECTIONS`, `groupPackagesByCategory`), `lib/package-catalog.test.ts`
- Rewrite: `components/ui/package-card.tsx`; Create: `components/ui/package-card.test.tsx`
- Rewrite: `app/(main)/packages/page.tsx`
- Modify: `components/home/packages-section.tsx` (compile fix; deleted in Task 9)

**Interfaces:**
- Produces: `CATEGORY_SECTIONS`, `groupPackagesByCategory<T extends OrderablePackage>(items): Array<{ key; title; intro; items: T[] }>`, `<PackageCard pkg: PublicPackage; priority?: boolean />`.

- [ ] **Step 1: Failing tests.** Append to `lib/package-catalog.test.ts`:

```ts
import { CATEGORY_SECTIONS, groupPackagesByCategory } from "./package-catalog"

// Reuses the file's existing `item(_id, extra: Partial<OrderablePackage>)` helper from lead-recovery Task 4.
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

  it("keeps category intros neutral (no service claims)", () => {
    for (const section of CATEGORY_SECTIONS) {
      expect(section.intro).not.toMatch(/private|free|pickup|guide|meal|bullock|cart|driver/i)
    }
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
    expect(html).toContain('data-fact="duration"')
    expect(html).toContain("Price on request")
    expect(html).not.toContain("Long description")
    expect(html).not.toContain("Water")
  })

  it("shows the from-price when set", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={{ ...pkg, priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }} />)
    expect(html).toContain("From US$45 per jeep")
  })

  it("keeps the WhatsApp link outside the card link and nests no controls", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={pkg} />)
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<a /s)
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<button/s)
    expect(html).toContain("wa.me")
  })

  it("uses the admin photo description as alt text", () => {
    const html = renderToStaticMarkup(<PackageCard pkg={{ ...pkg, imageAlts: ["Elephants drinking at the tank"] }} />)
    expect(html).toContain('alt="Elephants drinking at the tank"')
  })

  it("falls back to a truncated description without a summary", () => {
    expect(renderToStaticMarkup(<PackageCard pkg={{ ...pkg, summary: undefined }} />)).toContain("Long description")
  })
})
```

Run: `pnpm test lib/package-catalog.test.ts components/ui/package-card.test.tsx`
Expected: FAIL. `groupPackagesByCategory` is not exported, and `PackageCard` has no `pkg` prop.

**If `next/image` throws under Vitest** because the remote host isn't configured (`next/image` reads `process.env.__NEXT_IMAGE_OPTS`, which only `next build`/`next dev` inject), create `vitest.setup.ts` and register it with `test.setupFiles: ["./vitest.setup.ts"]`:

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

Don't mock `next/image`; the tests must exercise the real markup.

- [ ] **Step 2: Implement.** Append to `lib/package-catalog.ts`:

```ts
export const CATEGORY_SECTIONS = [
  { key: "safari", title: "Jeep safaris", intro: "Jeep safaris to Minneriya, Kaudulla and Hurulu Eco Park from Habarana." },
  { key: "experience", title: "Village & food experiences", intro: "Village and food experiences around Habarana." },
  { key: "tour", title: "Day tours", intro: "Day tours to the ancient cities and temples of the Cultural Triangle." },
  { key: "stay", title: "Stays", intro: "Places to stay in Habarana." },
  { key: "other", title: "More tours", intro: "Other experiences around Habarana." },
] as const satisfies ReadonlyArray<{ key: PackageCategory | "other"; title: string; intro: string }>

export function groupPackagesByCategory<T extends OrderablePackage>(items: readonly T[]) {
  const sorted = sortPackages(items)
  return CATEGORY_SECTIONS.map((section) => ({
    ...section,
    items: sorted.filter((p) => (p.category ?? "other") === section.key),
  })).filter((group) => group.items.length > 0)
}
```

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
              alt={pkg.imageAlts?.[0] ?? pkg.name}
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
          <span data-fact="duration" className="absolute top-3 left-3 inline-flex items-center gap-1 rounded bg-background/90 px-2 py-1 text-xs font-medium">
            <Clock className="size-3.5" aria-hidden="true" />
            {pkg.duration}
          </span>
        </div>
        <div className="grid gap-2 px-5 pt-5">
          <h3 className="text-xl leading-snug group-hover:underline group-hover:underline-offset-4">{pkg.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{pkg.summary ?? truncateAtWord(pkg.description, 140)}</p>
        </div>
      </Link>
      <div className="mt-auto grid gap-4 px-5 pt-4 pb-5">
        {pkg.category === "safari" && <SeasonStrip season={pkg.season} size="sm" />}
        <p data-price className={price ? "font-semibold" : "text-sm text-muted-foreground"}>
          {price ?? PRICE_ON_REQUEST}
        </p>
        <div className="flex items-center justify-between gap-3 text-sm font-medium">
          <Link href={href} className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
            View details <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={buildWhatsAppUrl({ packageName: pkg.name })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask about ${pkg.name} on WhatsApp`}
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
            Message us your dates and we&apos;ll reply within 24 hours with availability and the current price.
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

In `components/home/packages-section.tsx`, pass `pkg={packageItem}` (compile fix only).

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
- Create: `components/packages/package-gallery.tsx`, `components/packages/booking-panel.tsx`, `components/packages/landing-sections.tsx`, `components/packages/landing-sections.test.tsx`, `components/common/final-cta.tsx`, `lib/package-meta.ts`, `lib/package-meta.test.ts`
- Rewrite: `app/(main)/packages/[id]/page.tsx`
- Delete: `app/(main)/packages/[id]/package-details.tsx`, `components/ui/image-gallery.tsx` (after `grep -rn "image-gallery\|package-details" app components` shows no other importer)

**Interfaces:**
- Produces:
  - `resolvePackageMeta(pkg): { title; description }`
  - `<PackageGallery images; name; alts? />` and `spanFor(index, count)`
  - `<BookingPanel pkg />`
  - `<PackageHeader pkg />` (H1, price, trust, chips, compact CTAs)
  - Sections: `FactChips`, `Highlights`, `WhenToGo`, `Itinerary`, `IncludedList`, `PickupAndTimes`, `WhatToBring`, `AboutExperience`, `PackageFaqs`. Each returns `null` without usable data.
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
    "Embark on a jeep safari through Hurulu Eco Park, where herds of wild elephants gather near the reservoir and our local guide explains their behaviour along the way for you.",
  duration: "3 hours",
  included: [],
  images: [],
} satisfies PublicPackage

describe("resolvePackageMeta", () => {
  it("prefers the admin SEO fields and adds the brand", () => {
    expect(resolvePackageMeta({ ...pkg, seoTitle: "Hurulu Jeep Safari from Habarana", seoDescription: "Short." })).toEqual({
      title: "Hurulu Jeep Safari from Habarana | Ceylon Safari",
      description: "Short.",
    })
  })

  it("does not double the brand", () => {
    expect(resolvePackageMeta({ ...pkg, seoTitle: "Hurulu Safari | Ceylon Safari" }).title).toBe("Hurulu Safari | Ceylon Safari")
  })

  it("falls back to name, then summary, then a word-safe description", () => {
    expect(resolvePackageMeta(pkg).title).toBe("Hurulu Eco Park Safari | Ceylon Safari")
    expect(resolvePackageMeta({ ...pkg, summary: "Elephants at Hurulu." }).description).toBe("Elephants at Hurulu.")
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

import type { PublicPackage } from "@/lib/package-serialize"
import { BookingPanel } from "./booking-panel"
import {
  AboutExperience,
  FactChips,
  Highlights,
  IncludedList,
  Itinerary,
  PackageFaqs,
  PackageHeader,
  PickupAndTimes,
  WhatToBring,
  WhenToGo,
} from "./landing-sections"
import { PackageGallery, spanFor } from "./package-gallery"
import { FinalCta } from "@/components/common/final-cta"

const html = (node: React.ReactElement) => renderToStaticMarkup(node)
const pkg: PublicPackage = {
  _id: "a".repeat(24),
  slug: "village-experience-tour",
  name: "Village Experience Tour",
  description: "First paragraph.\n\nSecond paragraph.",
  duration: "4 hours",
  included: ["Lunch"],
  images: [],
  category: "experience",
}

describe("sections omit themselves without usable data", () => {
  it.each([
    ["Highlights", <Highlights key="h" />],
    ["WhenToGo (none)", <WhenToGo key="w1" />],
    ["WhenToGo (all months invalid)", <WhenToGo key="w2" season={{ peak: [0, 13], good: [] }} />],
    ["Itinerary", <Itinerary key="i" steps={[]} />],
    ["PickupAndTimes", <PickupAndTimes key="p" />],
    ["WhatToBring", <WhatToBring key="b" />],
    ["PackageFaqs", <PackageFaqs key="f" />],
    ["IncludedList", <IncludedList key="n" included={[]} />],
  ])("%s", (_name, node) => {
    expect(html(node)).toBe("")
  })
})

describe("sections with data", () => {
  it("WhenToGo renders once overlapping or duplicate months are normalised", () => {
    const out = html(<WhenToGo season={{ peak: [8, 8], good: [8, 7] }} />)
    expect(out).toContain("When to go")
    expect(out.match(/data-level="peak"/g)).toHaveLength(1)
  })

  it("renders the itinerary as an ordered list with times", () => {
    const out = html(<Itinerary steps={[{ time: "2:30 pm", title: "Pickup" }, { title: "Game drive" }]} />)
    expect(out).toContain("<ol")
    expect(out).toContain("2:30 pm")
  })

  it("renders every FAQ answer in server HTML", () => {
    expect(html(<PackageFaqs faqs={[{ question: "Private?", answer: "Yes, only your group." }]} />)).toContain("Yes, only your group.")
  })

  it("pickup never claims to be free", () => {
    const out = html(<PickupAndTimes pickupAreas={["Habarana"]} />)
    expect(out).toContain("Hotel pickup from")
    expect(out).not.toMatch(/free/i)
  })

  it("splits the description into paragraphs", () => {
    expect(html(<AboutExperience description={pkg.description} />).match(/<p/g)).toHaveLength(2)
  })

  it("fact chips show only known facts and mark duration", () => {
    const out = html(<FactChips duration="3 hours" pickupAreas={["Habarana"]} />)
    expect(out).toContain('data-fact="duration"')
    expect(out).toContain("Hotel pickup")
    expect(out).not.toContain("per jeep")
  })
})

describe("PackageHeader: first-viewport facts", () => {
  it("has the H1, price (or on request), trust, duration and WhatsApp, in that order", () => {
    const out = html(<PackageHeader pkg={pkg} />)
    const order = ["<h1", "data-price", "data-trust", 'data-fact="duration"', "wa.me"].map((needle) => out.indexOf(needle))
    expect(order.every((index) => index >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(out).toContain("Price on request")
  })
})

describe("BookingPanel", () => {
  it("offers price on request, WhatsApp, call and the form, with no nested controls or opacity", () => {
    const out = html(<BookingPanel pkg={pkg} />)
    expect(out).toContain("Price on request")
    expect(out).toContain('href="tel:+94766675883"')
    expect(out).toContain(`/book-now?packageId=${"a".repeat(24)}`)
    expect(out).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<button/s)
    expect(out).not.toMatch(/opacity:\s*0/)
  })

  it("makes no service claims of its own", () => {
    expect(html(<BookingPanel pkg={{ ...pkg, category: "safari" }} />)).not.toMatch(/free cancellation|instant confirmation|private jeep/i)
  })
})

describe("PackageGallery", () => {
  it("renders a placeholder and no images when there are none", () => {
    const out = html(<PackageGallery images={[]} name="X" />)
    expect(out).not.toContain("<img")
    expect(out).toContain('aria-label="No photos yet"')
  })

  it("renders the lead image once, marked as lead, with admin alt text", () => {
    const out = html(<PackageGallery images={["https://res.cloudinary.com/a.jpg", "https://res.cloudinary.com/b.jpg"]} name="X" alts={["Elephants at the tank"]} />)
    expect(out.match(/<img/g)).toHaveLength(2)
    expect(out.match(/data-lead-image/g)).toHaveLength(1)
    expect(out).toContain('alt="Elephants at the tank"')
    expect(out).toContain('alt="X, photo 2"')
  })

  it.each([2, 3, 4, 5])("mosaic spans fill 8 cells with %i images", (count) => {
    const cells = (span: string) => (span.includes("row-span-2") ? 4 : span.includes("col-span-2") ? 2 : 1)
    expect(Array.from({ length: count }, (_, i) => cells(spanFor(i, count))).reduce((a, b) => a + b, 0)).toBe(8)
  })
})

describe("FinalCta", () => {
  it("is generic by default so non-safari pages promise no park or elephants", () => {
    expect(html(<FinalCta />)).not.toMatch(/elephant|park|safari/i)
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

- [ ] **Step 3: Implement the sections and header.** Create `components/packages/landing-sections.tsx`:

```tsx
import { Check, Clock, MapPin, Sun, Users, X } from "@phosphor-icons/react/dist/ssr"

import { ContactActions } from "@/components/common/contact-actions"
import { TrustLine } from "@/components/common/trust-line"
import { SeasonStrip } from "@/components/packages/season-strip"
import { splitParagraphs } from "@/lib/package-landing"
import type { ItineraryStep, PackageFaq, PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"
import { buildSeasonCells, type Season } from "@/lib/season"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <h2 id={id} className="text-2xl md:text-3xl">
        {title}
      </h2>
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
  const chips: Array<{ icon: typeof Clock; label: string; fact: string }> = [{ icon: Clock, label: duration, fact: "duration" }]
  if (groupSize) chips.push({ icon: Users, label: groupSize, fact: "group" })
  if (timeSlots?.length) chips.push({ icon: Sun, label: timeSlots.join(" · "), fact: "times" })
  if (pickupAreas?.length) chips.push({ icon: MapPin, label: "Hotel pickup", fact: "pickup" })

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Key facts">
      {chips.map(({ icon: Icon, label, fact }) => (
        <li key={fact} data-fact={fact} className="inline-flex items-center gap-1.5 rounded border bg-card px-3 py-1.5 text-sm">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}

/** Mobile first viewport: what, price, trust, duration, WhatsApp. Desktop CTAs live in the booking panel. */
export function PackageHeader({ pkg }: { pkg: PublicPackage }) {
  const price = formatPrice(pkg)
  return (
    <header className="grid gap-3">
      <h1 className="text-3xl md:text-5xl">{pkg.name}</h1>
      <p data-price className={price ? "text-lg font-semibold" : "text-muted-foreground"}>
        {price ?? `${PRICE_ON_REQUEST} · reply within 24 hours`}
      </p>
      <TrustLine />
      <FactChips duration={pkg.duration} groupSize={pkg.groupSize} timeSlots={pkg.timeSlots} pickupAreas={pkg.pickupAreas} />
      <ContactActions compact packageName={pkg.name} className="lg:hidden" />
      {pkg.summary && <p className="max-w-prose text-lg text-muted-foreground">{pkg.summary}</p>}
    </header>
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
  if (!buildSeasonCells(season)) return null
  return (
    <Section title="When to go">
      <SeasonStrip season={season} />
    </Section>
  )
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
            <dt className="text-sm font-medium text-muted-foreground">Hotel pickup from</dt>
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
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
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
          <details key={faq.question} className="rounded-lg border bg-card p-4 open:shadow-sm">
            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
            <p className="mt-2 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: Booking panel, gallery, final CTA.** Create `components/packages/booking-panel.tsx`:

```tsx
import Link from "next/link"

import { ContactActions } from "@/components/common/contact-actions"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"

/** Desktop only (sticky right column); on mobile the header CTAs and contact bar replace it. */
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
      <p className="border-t pt-4 text-sm text-muted-foreground">No payment needed to ask.</p>
    </aside>
  )
}
```

Create `components/packages/package-gallery.tsx`. It's **one** list of images whose layout changes by breakpoint, so no image is duplicated and the lead is requested once.

```tsx
import Image from "next/image"
import { Image as ImageIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

const MOBILE_LIMIT = 8
const DESKTOP_LIMIT = 5

/**
 * Tile spans that exactly fill the 4×2 desktop grid.
 * 2 → lead + tall right half · 3 → lead + two wide tiles · 4 → lead + 2 small + 1 wide · 5 → lead + 4 small.
 */
export function spanFor(index: number, count: number): string {
  if (count <= 1) return ""
  if (index === 0) return "md:col-span-2 md:row-span-2"
  if (count === 2) return "md:col-span-2 md:row-span-2"
  if (count === 3) return "md:col-span-2"
  if (count === 4 && index === count - 1) return "md:col-span-2"
  return ""
}

export function PackageGallery({ images, name, alts }: { images: string[]; name: string; alts?: string[] }) {
  if (images.length === 0) {
    return (
      <div
        role="img"
        aria-label="No photos yet"
        className="flex aspect-[16/9] items-center justify-center rounded-lg bg-surface-sunken text-muted-foreground md:aspect-[21/8]"
      >
        <ImageIcon size={56} aria-hidden="true" />
      </div>
    )
  }

  const shown = images.slice(0, MOBILE_LIMIT)
  const desktopCount = Math.min(images.length, DESKTOP_LIMIT)

  return (
    <div className="relative -mx-4 md:mx-0">
      <ul
        aria-label={`${name} photos`}
        className={cn(
          "flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2",
          "md:grid md:h-[420px] md:snap-none md:overflow-hidden md:rounded-lg md:px-0 md:pb-0",
          desktopCount === 1 ? "md:grid-cols-1" : "md:grid-cols-4 md:grid-rows-2"
        )}
      >
        {shown.map((src, index) => (
          <li
            key={src}
            {...(index === 0 ? { "data-lead-image": "" } : {})}
            className={cn(
              "relative aspect-[16/9] w-[85%] shrink-0 snap-center overflow-hidden rounded-lg bg-surface-sunken",
              "md:aspect-auto md:w-auto md:rounded-none",
              index >= DESKTOP_LIMIT && "md:hidden",
              spanFor(index, desktopCount)
            )}
          >
            <Image
              src={src}
              alt={alts?.[index] ?? `${name}, photo ${index + 1}`}
              fill
              priority={index === 0}
              sizes={index === 0 ? "(min-width: 768px) 50vw, 85vw" : "(min-width: 768px) 25vw, 85vw"}
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <span className="pointer-events-none absolute top-3 left-7 rounded bg-background/90 px-2 py-1 text-xs font-medium md:hidden">
          {images.length} photos · swipe
        </span>
      )}
    </div>
  )
}
```

Create `components/common/final-cta.tsx`:

```tsx
import { ContactActions } from "@/components/common/contact-actions"

export function FinalCta({ title = "Planning your trip to Habarana?", packageName }: { title?: string; packageName?: string }) {
  return (
    <section className="bg-primary px-4 py-16 text-primary-foreground">
      <div className="container mx-auto grid max-w-3xl justify-items-center gap-5 text-center">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        <p className="max-w-xl text-primary-foreground/85">
          Send us your date and hotel. We&apos;ll reply within 24 hours with availability and the current price. No payment
          needed to ask.
        </p>
        <ContactActions packageName={packageName} className="justify-center" />
      </div>
    </section>
  )
}
```

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Compose the page.** Rewrite the body of `app/(main)/packages/[id]/page.tsx`. Keep `generateStaticParams`, not-found handling, the slug `permanentRedirect` and JSON-LD (with `offers`). `generateMetadata` uses `resolvePackageMeta(packageData)`: `title: { absolute: meta.title }`, with the same values for OG/Twitter. Render:

```tsx
    <main className="bg-background pt-20">
      <JsonLd data={structuredData} />
      <div className="container mx-auto grid gap-6 px-4 py-4 md:py-6">
        <div className="hidden md:block">
          <Breadcrumbs name={packageData.name} />
        </div>
        <PackageGallery images={packageData.images} name={packageData.name} alts={packageData.imageAlts} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-10">
            <PackageHeader pkg={packageData} />
            <Highlights items={packageData.highlights} />
            <WhenToGo season={packageData.season} />
            <Itinerary steps={packageData.itinerary} />
            <IncludedList included={packageData.included} notIncluded={packageData.notIncluded} />
            <PickupAndTimes pickupAreas={packageData.pickupAreas} timeSlots={packageData.timeSlots} />
            <WhatToBring items={packageData.whatToBring} />
            <AboutExperience description={packageData.description} />
            <PackageFaqs faqs={packageData.faqs} />
            <div className="md:hidden">
              <Breadcrumbs name={packageData.name} />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel pkg={packageData} />
            </div>
          </div>
        </div>
      </div>
      {relatedPackages.length > 0 && (
        <section className="mt-16 bg-surface-sunken px-4 py-14">
          <div className="container mx-auto grid gap-8">
            <h2>{packageData.category === "safari" ? "Other safaris from Habarana" : "You might also like"}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((p) => (
                <PackageCard key={p._id} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <FinalCta title={packageData.category === "safari" ? "Ready to book your safari?" : undefined} packageName={packageData.name} />
      <MobileContactBar packageName={packageData.name} price={packageData} />
    </main>
```

`Breadcrumbs` is a small server component in the same file, moved from `package-details.tsx`'s breadcrumb block. Delete `package-details.tsx`, and delete `image-gallery.tsx` if grep shows no other importer.

- [ ] **Step 6: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

With `pnpm dev`: `node scripts/verify-layout.mjs http://localhost:3000 "/packages/hurulu-eco-park-safari:facts" "/packages/sri-lankan-culinary-journey:facts"`
Expected: all PASS.

```bash
git add components/packages components/common/final-cta.tsx lib/package-meta.ts lib/package-meta.test.ts "app/(main)/packages/[id]" components/ui/image-gallery.tsx
git commit -m "feat: rebuild package pages as conversion-first landing pages"
```

---

### Task 9: Homepage

**Files:**
- Rewrite: `components/home/hero-section.tsx`
- Create: `components/home/park-chooser.tsx`, `components/home/home-sections.test.tsx`, `components/home/real-guests.tsx`, `components/home/how-booking-works.tsx`, `components/home/more-experiences.tsx`
- Rewrite: `app/(main)/page.tsx`
- Delete: `components/home/features-section.tsx`, `components/home/plan-visit-section.tsx`, `components/home/cta-banner-section.tsx`, `components/home/packages-section.tsx`, `components/home/testimonials-section.tsx`
- Modify: `components/home/featured-blogs-section.tsx` (fix `Link`+`Button` nesting)

**Interfaces:**
- Produces:
  - `<HeroSection safaris: PublicPackage[] />`, which renders quick-pick rows when safaris exist
  - `<ParkChooser safaris: PublicPackage[] />`
  - `<MoreExperiences packages: PublicPackage[] />`
  - `<RealGuests />`, `<HowBookingWorks />`

- [ ] **Step 1: Failing tests.** Create `components/home/home-sections.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { PublicPackage } from "@/lib/package-serialize"
import HeroSection from "./hero-section"
import { HowBookingWorks } from "./how-booking-works"
import { MoreExperiences } from "./more-experiences"
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

const safaris = [
  make("minneriya", { category: "safari", sortOrder: 1, priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }),
  make("hurulu", { category: "safari", sortOrder: 2 }),
]

describe("HeroSection", () => {
  it("answers what, duration, price, trust and WhatsApp for each safari", () => {
    const html = renderToStaticMarkup(<HeroSection safaris={safaris} />)
    expect(html).toContain("<h1")
    expect(html).toContain("data-trust")
    expect(html).toContain("wa.me")
    expect(html.match(/data-fact="duration"/g)).toHaveLength(2)
    expect(html).toContain("From US$45 per jeep")
    expect(html).toContain("Price on request")
    expect(html).toContain('href="/packages/hurulu"')
  })

  it("makes no service claims", () => {
    expect(renderToStaticMarkup(<HeroSection safaris={safaris} />)).not.toMatch(/private|free|pickup from|guide/i)
  })

  it("still renders without safaris, just without quick picks", () => {
    const html = renderToStaticMarkup(<HeroSection safaris={[]} />)
    expect(html).toContain("<h1")
    expect(html).not.toContain('data-fact="duration"')
  })
})

describe("ParkChooser and MoreExperiences", () => {
  it("chooser shows safaris in order with neutral advice", () => {
    const html = renderToStaticMarkup(<ParkChooser safaris={safaris} />)
    expect(html.indexOf("/packages/minneriya")).toBeLessThan(html.indexOf("/packages/hurulu"))
    expect(html).toContain("Not sure which park?")
    expect(html).not.toMatch(/herds are|that week/i)
  })

  it("chooser renders nothing without safaris", () => {
    expect(renderToStaticMarkup(<ParkChooser safaris={[]} />)).toBe("")
  })

  it("more experiences shows only non-safaris and renders nothing without them", () => {
    const html = renderToStaticMarkup(<MoreExperiences packages={[make("village", { category: "experience" }), ...safaris]} />)
    expect(html).toContain("/packages/village")
    expect(html).not.toContain("/packages/minneriya")
    expect(renderToStaticMarkup(<MoreExperiences packages={safaris} />)).toBe("")
  })
})

it("how booking works describes the process only", () => {
  const html = renderToStaticMarkup(<HowBookingWorks />)
  expect(html).toContain("<ol")
  expect(html).not.toMatch(/free|private|Sigiriya|Dambulla/i)
})
```

Run: `pnpm test components/home/home-sections.test.tsx`
Expected: FAIL, modules not found or wrong props.

- [ ] **Step 2: Implement.** Rewrite `components/home/hero-section.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

import { ContactActions } from "@/components/common/contact-actions"
import { TrustLine } from "@/components/common/trust-line"
import { imagery } from "@/config/imagery"
import type { PublicPackage } from "@/lib/package-serialize"
import { formatPrice, PRICE_ON_REQUEST } from "@/lib/pricing"

export default function HeroSection({ safaris }: { safaris: PublicPackage[] }) {
  return (
    <section className="relative isolate overflow-hidden px-4 pt-24 pb-8 md:pt-32 md:pb-16">
      <Image src={imagery.hero.src} alt={imagery.hero.alt} fill priority data-lead-image sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/55 to-black/75" aria-hidden="true" />
      <div className="container mx-auto">
        <div className="grid max-w-2xl gap-4 text-white">
          <p className="text-sm font-medium tracking-wide text-white/85 uppercase">Minneriya · Kaudulla · Hurulu Eco Park</p>
          <h1>Jeep safaris from Habarana</h1>
          <TrustLine tone="light" />
          <ContactActions compact className="max-w-md [&_a:last-child]:border-white/60 [&_a:last-child]:bg-transparent [&_a:last-child]:text-white" />
          {safaris.length > 0 && (
            <ul className="grid max-w-md gap-1.5" aria-label="Safaris">
              {safaris.map((pkg) => (
                <li key={pkg._id}>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="flex items-center gap-3 rounded bg-black/35 px-3 py-2 backdrop-blur-sm hover:bg-black/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block leading-snug font-semibold">{pkg.name}</span>
                      <span className="block text-sm text-white/85">
                        <span data-fact="duration">{pkg.duration}</span> ·{" "}
                        <span data-price>{formatPrice(pkg) ?? PRICE_ON_REQUEST}</span>
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="max-w-xl text-white/90">
            Message us your date and hotel. We&apos;ll reply within 24 hours with the park, the time and the current price.
          </p>
        </div>
      </div>
    </section>
  )
}
```

The gradient keeps white text ≥ 4.5:1 over the brightest part of the photo. Check the H1, row text and the Call button outline in the Task 12 screenshot, and darken `via-black/55` if any area reads low.

Create `components/home/park-chooser.tsx`:

```tsx
import PackageCard from "@/components/ui/package-card"
import type { PublicPackage } from "@/lib/package-serialize"

export function ParkChooser({ safaris }: { safaris: PublicPackage[] }) {
  if (!safaris.length) return null
  return (
    <section id="safaris" className="scroll-mt-24 px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="grid max-w-2xl gap-3">
          <h2>Choose your park</h2>
          <p className="text-muted-foreground">Not sure which park? Send us your dates and we&apos;ll recommend one.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safaris.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
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
          <h2>Guests on safari with us</h2>
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

Create `components/home/how-booking-works.tsx`:

```tsx
import { ContactActions } from "@/components/common/contact-actions"

const STEPS = [
  { title: "Message us your date and hotel", detail: "WhatsApp or call, and tell us how many people are coming." },
  { title: "We reply within 24 hours", detail: "With availability, the time, the current price and pickup details." },
  { title: "Confirm and meet your guide", detail: "Once it's confirmed, you're set for the day." },
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

Run: `pnpm test components/home/home-sections.test.tsx`
Expected: PASS.

- [ ] **Step 3: Compose the homepage.** `app/(main)/page.tsx`, keeping the existing `metadata` export:

```tsx
export default async function Home() {
  const packages = await getPackages()
  const safaris = groupPackagesByCategory(packages).find((group) => group.key === "safari")?.items ?? []

  return (
    <main>
      <HeroSection safaris={safaris} />
      <ParkChooser safaris={safaris} />
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

Delete the five replaced home components after `grep -rn` confirms no importer. In `featured-blogs-section.tsx`, change the `Link` + `Button` to `Button asChild`.

- [ ] **Step 4: Verify and commit.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

With `pnpm dev`: `node scripts/verify-layout.mjs http://localhost:3000 "/:facts"`
Expected: all PASS.

```bash
git add components/home "app/(main)/page.tsx"
git commit -m "feat: rebuild the homepage around parks, real guests and WhatsApp"
```

---

### Task 10: Book-now, contact and blog

**Files:**
- Create: `lib/booking-prefill.ts`, `lib/booking-prefill.test.ts`, `components/common/booking-form.test.tsx`
- Modify: `components/common/booking-form.tsx`, `app/(main)/book-now/page.tsx`, `app/(main)/contact/page.tsx`, `app/(main)/blogs/[slug]/page.tsx`, `app/(main)/blogs/page.tsx`

**Interfaces:**
- Produces: `resolveInitialPackageId(raw: string | string[] | undefined, packages: ReadonlyArray<{ _id: string }>): string`, and `BookingForm({ packages, initialPackageId })`.

- [ ] **Step 1: Failing tests.** Create `lib/booking-prefill.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { resolveInitialPackageId } from "./booking-prefill"

const packages = [{ _id: "a".repeat(24) }, { _id: "b".repeat(24) }]

describe("resolveInitialPackageId", () => {
  it("accepts the id of a current package", () => {
    expect(resolveInitialPackageId("b".repeat(24), packages)).toBe("b".repeat(24))
  })

  it.each([
    ["missing", undefined],
    ["malformed", "not-an-id"],
    ["stale id from an old link", "c".repeat(24)],
    ["repeated query param", ["a".repeat(24), "b".repeat(24)]],
  ])("returns empty for %s", (_label, raw) => {
    expect(resolveInitialPackageId(raw, packages)).toBe("")
  })
})
```

Create `components/common/booking-form.test.tsx`:

```tsx
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
})
```

The selected-value behaviour is verified in the browser, in Task 12 via `verify-layout.mjs` on `/book-now?packageId=…`, because Radix Select resolves the displayed value on the client.

Run: `pnpm test lib/booking-prefill.test.ts components/common/booking-form.test.tsx`
Expected: FAIL. The module is missing, `useSearchParams` isn't mocked (throws), and `opacity:0` is present.

- [ ] **Step 2: Implement.** Create `lib/booking-prefill.ts`:

```ts
const OBJECT_ID = /^[a-f\d]{24}$/i

/** Prefill only a current package; stale or malformed ids from old links become "". */
export function resolveInitialPackageId(
  raw: string | string[] | undefined,
  packages: ReadonlyArray<{ _id: string }>
): string {
  if (typeof raw !== "string" || !OBJECT_ID.test(raw)) return ""
  return packages.some((pkg) => pkg._id === raw) ? raw : ""
}
```

`booking-form.tsx`:
- Remove `useSearchParams` and the `motion` import.
- Accept `initialPackageId?: string` and use it as the `packageId` default.
- Change the `Select` to controlled: `value={field.value}` instead of `defaultValue`, so the prefill displays.
- Replace `<motion.div …>` with `<div className="bg-white rounded-xl shadow-lg p-6 md:p-8">`.

`app/(main)/book-now/page.tsx`:
- Accept `{ searchParams }: { searchParams: Promise<{ packageId?: string | string[] }> }`.
- Compute `initialPackageId = resolveInitialPackageId((await searchParams).packageId, packages)`.
- Remove the `Suspense` wrapper.
- Above the form, add `<div className="mb-8 grid gap-3 rounded-lg border bg-card p-6"><h2 className="text-2xl">Fastest: message us on WhatsApp</h2><p className="text-muted-foreground">We reply within 24 hours with availability and the current price.</p><ContactActions /></div>`.
- Use `<FAQSection variant="booking" />`, and end `<main>` with `<MobileContactBar />`.

`app/(main)/contact/page.tsx`: the `motion.div` becomes a `div`, drop the framer import, keep the Task 3 `tel:` link, and end `<main>` with `<MobileContactBar />`.

`app/(main)/blogs/[slug]/page.tsx`:
- Change the outer `<div className="min-h-screen bg-white">` to `<main className="min-h-screen bg-white">`.
- Insert `<FinalCta title="Planning a safari from Habarana?" />` before `{/* Comments Section */}`.
- End `<main>` with `<MobileContactBar />`.

`app/(main)/blogs/page.tsx`: end `<main>` with `<MobileContactBar />`.

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.

- [ ] **Step 3: Commit.**

```bash
git add lib/booking-prefill.ts lib/booking-prefill.test.ts components/common/booking-form.tsx components/common/booking-form.test.tsx "app/(main)/book-now/page.tsx" "app/(main)/contact/page.tsx" "app/(main)/blogs/[slug]/page.tsx" "app/(main)/blogs/page.tsx"
git commit -m "feat: server-rendered inquiry form, WhatsApp-first contact and blog CTAs"
```

---

### Task 11: Landing copy drafts for the owner

**Files:**
- Create: `docs/content/package-landing-drafts.md`

- [ ] **Step 1: Write the drafts** for Minneriya, Kaudulla, Hurulu, the village experience and the cooking class. Each package gets two blocks.
  - **Paste-ready.** Every landing field in the exact admin format from Task 2, using **only statements that already appear in live copy**: the live package descriptions, the five live blog posts and the live FAQ. There are no markers inside this block; the source URLs are listed under it.
  - **Owner to confirm before publishing.** A question list: every price, start time, ticket inclusion, pickup area and charge, group size, and season month, plus each contradiction between sources (season: "May–Oct" vs "Apr–Sep" vs "Aug–Dec"; herd size: "200–300" vs "300–700"), each as a question with the conflicting quotes. Nothing from this list appears in the paste-ready block.
  - Add typo fixes for each `description` as before/after pairs.
  - Add a note that the 500-unique-word gate (Task 12) is met only once the confirmed content is in.

- [ ] **Step 2: Commit.**

```bash
git add docs/content/package-landing-drafts.md
git commit -m "docs: draft landing-page copy for the five core packages"
```

---

### Task 12: Whole-branch verification and release gates

**Files:**
- Create: `scripts/landing-word-report.mjs`

- [ ] **Step 1: Unique-content report.** Create `scripts/landing-word-report.mjs`:

```js
#!/usr/bin/env node
// Words per safari page that sit in sentences appearing on no other package page.
// Advisory: prints GATE OPEN until every safari page has >= 500 such words.
//   node scripts/landing-word-report.mjs http://localhost:3000
const base = process.argv[2] ?? "http://localhost:3000"
const MIN_WORDS = 500

const listing = await (await fetch(new URL("/packages", base))).text()
const slugs = [...new Set([...listing.matchAll(/href="\/packages\/([a-z0-9-]+)"/g)].map((m) => m[1]))]

const mainText = (html) =>
  (html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "")
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
const sentences = (text) => text.split(/(?<=[.!?])\s+/).map((s) => s.trim().toLowerCase()).filter((s) => s.split(" ").length >= 4)

const pages = {}
for (const slug of slugs) pages[slug] = sentences(mainText(await (await fetch(new URL(`/packages/${slug}`, base))).text()))

let open = false
for (const slug of slugs.filter((s) => /safari/.test(s))) {
  const others = new Set(slugs.filter((s) => s !== slug).flatMap((s) => pages[s]))
  const words = pages[slug].filter((s) => !others.has(s)).reduce((n, s) => n + s.split(" ").length, 0)
  if (words < MIN_WORDS) open = true
  console.log(`${words >= MIN_WORDS ? "OK  " : "OPEN"}  ${slug}: ${words} unique words`)
}
console.log(open ? `\nGATE OPEN: needs owner content (>= ${MIN_WORDS} unique words per safari page)` : "\nGATE MET")
```

- [ ] **Step 2: Gates.**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
Expected: all green.

- [ ] **Step 3: HTML checks on `pnpm start`** (dev DB):

```bash
B=http://localhost:3000
count() { grep -o "$1" | wc -l | tr -d ' '; }
PKG=/packages/hurulu-eco-park-safari
curl -s $B/ | count 'wa.me/94766675883'                                          # ≥ 4 (hero, quick-pick cards, final CTA, bar)
curl -s $B/ | grep -oE '<a[^>]*>\s*<button' | wc -l                              # 0
curl -s $B/ | count 'opacity:0'                                                  # 0
curl -s $B$PKG | grep -oE '<title>[^<]+</title>'                                 # "… | Ceylon Safari"
curl -s $B$PKG | grep -oiE 'free cancellation|instant confirmation|free hotel pickup' | wc -l   # 0
curl -s $B$PKG | grep -o '"availability"' | wc -l                                # 0
curl -s $B/definitely-missing | grep -oE '<meta name="robots"[^>]*>'             # exactly one noindex
grep -rn "umami\|posthog" app components lib config                             # no output
```

- [ ] **Step 4: Browser checks.**

```bash
ID=$(curl -s $B$PKG | grep -oE 'packageId=[a-f0-9]{24}' | head -1 | cut -d= -f2)
LONG=$(curl -s $B/packages | grep -oE 'href="/packages/[a-z0-9-]+"' | sed 's/href="//;s/"//' | awk '{ print length, $0 }' | sort -rn | head -1 | cut -d' ' -f2)
node scripts/verify-layout.mjs $B "/:facts" "$PKG:facts" "$LONG:facts" /packages /contact "/book-now?packageId=$ID" /blogs
```

Expected: all PASS at phone, tablet and desktop, at 100% and 125% text. Then paste one Task 11 paste-ready draft into the **dev** admin for Hurulu and rerun `node scripts/verify-layout.mjs $B "$PKG:facts"`. Expected: all PASS with full landing data too.

- [ ] **Step 5: Visual pass.** Take 390 px and 1280 px screenshots of the same pages (CDP `Page.captureScreenshot`, or `verify-layout.mjs` extended locally). Check hero text contrast over the photo, the season strip's legibility, and that nothing clips. Fix, then rerun Step 4.

- [ ] **Step 6: Content gate.** Run `node scripts/landing-word-report.mjs $B`. Report the per-page numbers to the user. **GATE OPEN is expected** until the owner's confirmed content is entered; it's reported, not claimed as met.

- [ ] **Step 7: Report.** Give the user the evidence plus the owner/dev launch checklist:
  1. Set explicit `category` and `sortOrder` in admin. Inference covers today, but explicit is better.
  2. Confirm and enter the Task 11 content.
  3. Delete the `explore-sri-lanka-…` package so the Task 7 redirect applies.
  4. Rerun Steps 4 and 6 against production after deploy.
