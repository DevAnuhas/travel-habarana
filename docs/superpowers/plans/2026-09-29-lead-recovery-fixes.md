# Lead Recovery Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the booking-flow defects and add the conversion paths and measurement that the 29 Sep 2026 audit found missing, so visitors who reach ceylonsafari.com can actually contact the business and every contact is counted.

**Architecture:** Behaviour lives in small pure modules under `lib/` and `config/`, each with a Vitest suite. Next.js pages and components consume those modules and stay thin. Package merchandising data (category, order, price) is added as optional Mongo fields so existing records keep working unchanged. Analytics is Umami Cloud, driven mostly by `data-umami-event` attributes so server components need no client JS.

**Tech Stack:** Next.js 16 (App Router, Cache Components), React 19, TypeScript 6, Mongoose 9, Zod 4, react-hook-form, Radix UI, Tailwind 4, Vitest (new), pnpm 11.

**Spec:** Traycer artifact `website-lead-audit` (`/Users/mac/.traycer/epics/169febd4-b2f5-432b-b197-4cb101101e73/artifacts/website-lead-audit/index.md`), Tracks B and C plus the Track E redirects. Decisions settled on 29 Sep 2026: Umami Cloud for analytics; an optional "From" price field; redirects live in code while the site owner's developer makes the admin/Sanity content edits; Vitest is added and all work is test-first.

## Global Constraints

- Formatting follows `.prettierrc`: no semicolons, double quotes, 2-space indent, trailing commas `es5`. Older tab-indented files keep their existing style; do not reformat untouched lines.
- Commit after every task. Direct commit messages, **no AI attribution trailer** (user instruction overrides the default).
- New dependencies: `vitest` only (dev). No other packages.
- WhatsApp number: `+94 76 667 5883` (`siteConfig.contact.phoneE164`). Canonical origin: `https://www.ceylonsafari.com`.
- Umami Cloud tracker: `https://cloud.umami.is/script.js`. It posts events back to `https://cloud.umami.is`.
- Do not invent business policy. Cancellation, confirmation, and price copy must be either confirmed by the owner or phrased so it promises nothing.
- Existing package documents have none of the new fields. Every read path must tolerate `undefined` **and** `null`.
- Never write to the production database or Sanity dataset from this plan. Local verification uses `travelHabaranaDB-Dev`.

## Review Focus

1. **Admin clears a number field.** An emptied `<input type="number">` must save `null`, not `NaN` and not "keep the old value". Test pinned in Task 3.
2. **Package renamed back to an earlier name.** The new slug must leave `previousSlugs`, or the page would redirect to itself. Test pinned in Task 2.
3. **Tracker blocked by an ad-blocker, or not configured.** `trackEvent` must never throw, and the script must not render without a valid website id. Tests pinned in Tasks 8 and 9.
4. **Visitor with JavaScript disabled or slow.** Booking card, form and FAQ answers must be visible in server HTML, with no `opacity:0` and no content missing from the markup. Tests pinned in Tasks 6 and 11.
5. **Package names with `&`, quotes or trailing spaces** in WhatsApp messages, titles and descriptions. Tests pinned in Tasks 5 and 8.

---

### Task 1: Test harness + same-day bookings

Fixes audit H1: the calendar disables today, and the server's "not in the past" check runs in UTC, so a visitor east of UTC can never book today.

**Files:**
- Create: `vitest.config.mts`
- Create: `lib/booking-dates.ts`
- Create: `lib/booking-dates.test.ts`
- Create: `lib/types.test.ts`
- Modify: `package.json` (scripts + devDependency)
- Modify: `lib/types.ts:83-92` (`inquiryRequestSchema`)
- Modify: `components/common/booking-form.tsx:257` (calendar `disabled`)

**Interfaces:**
- Produces: `isSelectableBookingDate(candidate: Date, now: Date): boolean`, `isAcceptableSubmittedDate(submitted: Date, now: Date): boolean`, `SUBMITTED_DATE_GRACE_MS: number`. Also the `pnpm test` script and the `@/` alias inside Vitest.

- [ ] **Step 1: Install Vitest and add scripts**

Run: `pnpm add -D vitest`

In `package.json` `scripts`, add after `"typecheck"`:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

Create `vitest.config.mts`:

```ts
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = fileURLToPath(new URL(".", import.meta.url))

// Mirror Vercel's runtime (UTC). Date bugs that only appear in UTC stay
// invisible on a developer machine in Sri Lanka (+05:30) otherwise.
// Workers inherit this environment when Vitest spawns them.
process.env.TZ = "UTC"

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\/(.*)$/, replacement: `${root}$1` }],
  },
  // Vitest 5 transforms with oxc, whose default JSX runtime is automatic.
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", ".pnpm-store/**"],
  },
})
```

- [ ] **Step 2: Write the failing date tests**

Create `lib/booking-dates.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  isAcceptableSubmittedDate,
  isSelectableBookingDate,
  SUBMITTED_DATE_GRACE_MS,
} from "./booking-dates"

describe("isSelectableBookingDate", () => {
  const morning = new Date(2026, 8, 29, 10, 30)

  it("allows today (the calendar hands us local midnight)", () => {
    expect(isSelectableBookingDate(new Date(2026, 8, 29), morning)).toBe(true)
  })

  it("allows today late at night", () => {
    const lateNight = new Date(2026, 8, 29, 23, 59)
    expect(isSelectableBookingDate(new Date(2026, 8, 29), lateNight)).toBe(
      true
    )
  })

  it("allows future dates", () => {
    expect(isSelectableBookingDate(new Date(2026, 8, 30), morning)).toBe(true)
  })

  it("rejects yesterday", () => {
    expect(isSelectableBookingDate(new Date(2026, 8, 28), morning)).toBe(false)
  })
})

describe("isAcceptableSubmittedDate", () => {
  it("accepts today for a visitor in Sri Lanka (UTC+05:30)", () => {
    const localMidnight = new Date("2026-09-28T18:30:00.000Z")
    const now = new Date("2026-09-29T04:30:00.000Z")
    expect(isAcceptableSubmittedDate(localMidnight, now)).toBe(true)
  })

  it("accepts today late in the day for a visitor in UTC+14", () => {
    const localMidnight = new Date("2026-09-28T10:00:00.000Z")
    const now = new Date("2026-09-29T09:59:00.000Z")
    expect(isAcceptableSubmittedDate(localMidnight, now)).toBe(true)
  })

  it("accepts today for a visitor in UTC-12", () => {
    const localMidnight = new Date("2026-09-29T12:00:00.000Z")
    const now = new Date("2026-09-30T11:00:00.000Z")
    expect(isAcceptableSubmittedDate(localMidnight, now)).toBe(true)
  })

  it("rejects yesterday for a Sri Lanka visitor in the evening", () => {
    const yesterdayMidnight = new Date("2026-09-27T18:30:00.000Z")
    const now = new Date("2026-09-29T18:00:00.000Z")
    expect(isAcceptableSubmittedDate(yesterdayMidnight, now)).toBe(false)
  })

  it("draws the line at exactly the grace window", () => {
    const now = new Date("2026-09-29T12:00:00.000Z")
    const edge = new Date(now.getTime() - SUBMITTED_DATE_GRACE_MS)
    const past = new Date(edge.getTime() - 1)
    expect(isAcceptableSubmittedDate(edge, now)).toBe(true)
    expect(isAcceptableSubmittedDate(past, now)).toBe(false)
  })
})
```

- [ ] **Step 3: Run to verify failure**

Run: `pnpm test lib/booking-dates.test.ts`
Expected: FAIL, `Failed to resolve import "./booking-dates"`.

- [ ] **Step 4: Implement**

Create `lib/booking-dates.ts`:

```ts
const HOUR_MS = 60 * 60 * 1000

/**
 * A visitor's "today" begins at their local midnight, which is always less
 * than 24 hours before the current instant in every time zone. The extra hour
 * absorbs client/server clock skew; the cost is that "yesterday" is still
 * accepted for the first hour after local midnight, which is harmless for an
 * inquiry.
 */
export const SUBMITTED_DATE_GRACE_MS = 25 * HOUR_MS

/** Calendar rule, evaluated in the visitor's own time zone. */
export function isSelectableBookingDate(candidate: Date, now: Date): boolean {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  return candidate.getTime() >= startOfToday.getTime()
}

/** Server rule: the server cannot know the visitor's zone, only the instant. */
export function isAcceptableSubmittedDate(submitted: Date, now: Date): boolean {
  return submitted.getTime() >= now.getTime() - SUBMITTED_DATE_GRACE_MS
}
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm test lib/booking-dates.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 6: Failing schema test for the API rule**

Create `lib/types.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { inquiryRequestSchema } from "./types"

const inquiry = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+44 7700 900123",
  packageId: "a".repeat(24),
  numberOfPeople: 2,
}

describe("inquiryRequestSchema date rule", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-29T04:30:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("accepts today's date sent from Sri Lanka", () => {
    const result = inquiryRequestSchema.safeParse({
      ...inquiry,
      date: "2026-09-28T18:30:00.000Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a date two days in the past", () => {
    const result = inquiryRequestSchema.safeParse({
      ...inquiry,
      date: "2026-09-27T00:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })
})
```

Run: `pnpm test lib/types.test.ts`
Expected: FAIL on "accepts today's date sent from Sri Lanka". The UTC check rejects it.

- [ ] **Step 7: Wire the rules**

In `lib/types.ts` add the import at the top:

```ts
import { isAcceptableSubmittedDate } from "./booking-dates"
```

and replace the `inquiryRequestSchema` refine:

```ts
			.refine(
				(date) => isAcceptableSubmittedDate(date, new Date()),
				"Preferred date cannot be in the past"
			),
```

In `components/common/booking-form.tsx` add `import { isSelectableBookingDate } from "@/lib/booking-dates";` and replace line 257:

```tsx
												disabled={(date) =>
													!isSelectableBookingDate(date, new Date())
												}
```

- [ ] **Step 8: Verify**

Run: `pnpm test && pnpm typecheck`
Expected: all tests PASS; typecheck clean.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.mts lib/booking-dates.ts lib/booking-dates.test.ts lib/types.ts lib/types.test.ts components/common/booking-form.tsx
git commit -m "fix: allow same-day safari inquiries in every time zone"
```

---

### Task 2: Renaming a package keeps its old URL alive

Fixes audit H2: `PUT /api/packages/[id]` regenerates the slug on every rename, and the old URL then 404s.

**Files:**
- Create: `lib/package-slugs.ts`
- Create: `lib/package-slugs.test.ts`
- Modify: `models/Package.ts`
- Modify: `app/api/packages/[id]/route.ts:76-106`
- Modify: `lib/packages.ts` (`getPackage`)

**Interfaces:**
- Produces: `planSlugChange(current: SlugState, nextSlug: string): { slug: string; previousSlugs: string[] }` where `SlugState = { slug: string; previousSlugs: readonly string[] }`. `Package.previousSlugs: string[]`.
- Relies on: the existing `if (id !== packageData.slug) permanentRedirect(...)` in `app/(main)/packages/[id]/page.tsx`, which turns an old-slug lookup into a 308.

- [ ] **Step 1: Write the failing test**

Create `lib/package-slugs.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { planSlugChange } from "./package-slugs"

describe("planSlugChange", () => {
  it("leaves state alone when the slug does not change", () => {
    expect(
      planSlugChange({ slug: "hurulu", previousSlugs: ["old"] }, "hurulu")
    ).toEqual({ slug: "hurulu", previousSlugs: ["old"] })
  })

  it("records the outgoing slug", () => {
    expect(
      planSlugChange({ slug: "srilankan-tours", previousSlugs: [] }, "sri-lanka-tours")
    ).toEqual({ slug: "sri-lanka-tours", previousSlugs: ["srilankan-tours"] })
  })

  it("keeps older history without duplicates", () => {
    expect(
      planSlugChange({ slug: "b", previousSlugs: ["a", "b"] }, "c")
    ).toEqual({ slug: "c", previousSlugs: ["a", "b"] })
  })

  it("drops the new slug from history when reverting to an earlier name", () => {
    expect(planSlugChange({ slug: "b", previousSlugs: ["a"] }, "a")).toEqual({
      slug: "a",
      previousSlugs: ["b"],
    })
  })

  it("does not mutate the input", () => {
    const history = ["a"]
    planSlugChange({ slug: "b", previousSlugs: history }, "c")
    expect(history).toEqual(["a"])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test lib/package-slugs.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

Create `lib/package-slugs.ts`:

```ts
export interface SlugState {
  slug: string
  previousSlugs: readonly string[]
}

/**
 * Decide the slug history after a rename so every URL a package ever had keeps
 * resolving (the package page 308s old slugs to the current one).
 */
export function planSlugChange(
  current: SlugState,
  nextSlug: string
): { slug: string; previousSlugs: string[] } {
  if (nextSlug === current.slug) {
    return { slug: current.slug, previousSlugs: [...current.previousSlugs] }
  }

  const history = [...current.previousSlugs, current.slug].filter(
    (slug) => slug !== nextSlug
  )

  return { slug: nextSlug, previousSlugs: [...new Set(history)] }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test lib/package-slugs.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Persist and use the history**

`models/Package.ts`: add to the schema object after `images`:

```ts
		previousSlugs: { type: [String], default: [], index: true },
```

`app/api/packages/[id]/route.ts`: import `planSlugChange` from `@/lib/package-slugs` and replace the block from `// If name changed, update the slug too` to just before `const savedPackage` with:

```ts
			const packageData: Record<string, unknown> = { ...updatedPackage };

			if (updatedPackage.name !== packageItem.name) {
				let nextSlug = generateSlug(updatedPackage.name);

				const existingWithSlug = await Package.findOne({
					slug: nextSlug,
					_id: { $ne: packageItem._id },
				});

				if (existingWithSlug) {
					nextSlug = `${nextSlug}-${Date.now().toString().slice(-4)}`;
				}

				const slugState = planSlugChange(
					{
						slug: packageItem.slug,
						previousSlugs: packageItem.previousSlugs ?? [],
					},
					nextSlug
				);
				packageData.slug = slugState.slug;
				packageData.previousSlugs = slugState.previousSlugs;
			}
```

`lib/packages.ts` `getPackage`: add `previousSlugs?: string[]` to `PackageDocument`, and between the slug lookup and the ObjectId fallback insert:

```ts
	if (!packageItem) {
		packageItem = (await PackageModel.findOne({
			previousSlugs: identifier,
		}).lean()) as PackageDocument | null;
	}
```

A current slug always wins over another package's history because the `slug` lookup runs first.

- [ ] **Step 6: Verify against the dev database**

Copy the env first: `cp /Users/mac/Projects/travel-habarana/.env.local .env.local` (gitignored). The env points at `travelHabaranaDB-Dev`; confirm `db:` in any output says `-Dev`.

Run: `pnpm typecheck && pnpm dev`. In `/admin/packages` rename a dev package (e.g. append " Tour").
Run: `curl -sI http://localhost:3000/packages/<old-slug> | grep -iE "^(HTTP|location)"`
Expected: `HTTP/1.1 308` with `location: /packages/<new-slug>`. Rename it back and confirm the reverse also 308s.

- [ ] **Step 7: Commit**

```bash
git add lib/package-slugs.ts lib/package-slugs.test.ts models/Package.ts "app/api/packages/[id]/route.ts" lib/packages.ts
git commit -m "fix: keep renamed package URLs alive with permanent redirects"
```

---

### Task 3: Optional package merchandising fields (category, order, price)

Adds the data behind audit H3/H5/M4. Everything is optional, so existing packages validate and render unchanged.

**Files:**
- Create: `lib/package-catalog.ts`
- Modify: `lib/types.ts` (`packageSchema`)
- Modify: `lib/types.test.ts`
- Modify: `models/Package.ts`
- Modify: `lib/packages.ts` (`PublicPackage`, `PackageDocument`, `serializePackage`)
- Modify: `app/admin/(dashboard)/packages/page.tsx` (type, defaults, reset, submit body, General tab fields)

**Interfaces:**
- Produces:
  - `PACKAGE_CATEGORIES = ["safari", "experience", "tour", "stay"] as const`, `type PackageCategory`, `PACKAGE_CATEGORY_LABELS: Record<PackageCategory, string>`
  - `PRICE_CURRENCIES = ["USD", "LKR"] as const`, `type PriceCurrency`
  - `PRICE_UNITS = ["per jeep", "per person", "per group"] as const`, `type PriceUnit`
  - `PublicPackage` gains optional `category`, `sortOrder`, `priceFrom`, `priceCurrency`, `priceUnit`, `priceNote`. Each is `undefined` when unset, never `null`.

- [ ] **Step 1: Failing schema tests**

Append to `lib/types.test.ts`:

```ts
import { packageSchema } from "./types"

const legacyPackage = {
  name: "Hurulu Eco Park Safari",
  description: "A private jeep safari through Hurulu Eco Park.",
  duration: "3-4 hours",
  included: ["Private jeep"],
  images: ["https://res.cloudinary.com/demo/image/upload/hurulu.jpg"],
}

describe("packageSchema merchandising fields", () => {
  it("accepts a legacy package with none of the new fields", () => {
    expect(packageSchema.safeParse(legacyPackage).success).toBe(true)
  })

  it("accepts a fully merchandised package", () => {
    const result = packageSchema.safeParse({
      ...legacyPackage,
      category: "safari",
      sortOrder: 1,
      priceFrom: 45,
      priceCurrency: "USD",
      priceUnit: "per jeep",
      priceNote: "Park tickets not included",
    })
    expect(result.success).toBe(true)
  })

  it("accepts nulls so the admin can clear a field", () => {
    const result = packageSchema.safeParse({
      ...legacyPackage,
      category: null,
      sortOrder: null,
      priceFrom: null,
      priceCurrency: null,
      priceUnit: null,
      priceNote: null,
    })
    expect(result.success).toBe(true)
  })

  it("requires currency and unit when a price is set", () => {
    const result = packageSchema.safeParse({ ...legacyPackage, priceFrom: 45 })
    expect(result.success).toBe(false)
  })

  it.each([
    ["negative price", { priceFrom: -1, priceCurrency: "USD", priceUnit: "per jeep" }],
    ["NaN price", { priceFrom: Number.NaN, priceCurrency: "USD", priceUnit: "per jeep" }],
    ["unknown category", { category: "cruise" }],
    ["fractional sort order", { sortOrder: 1.5 }],
  ])("rejects %s", (_label, extra) => {
    expect(packageSchema.safeParse({ ...legacyPackage, ...extra }).success).toBe(
      false
    )
  })
})
```

Run: `pnpm test lib/types.test.ts`
Expected: FAIL on "requires currency and unit when a price is set" and on all four "rejects …" cases. Zod currently strips the unknown keys, so those payloads parse successfully.

- [ ] **Step 2: Implement constants and schema**

Create `lib/package-catalog.ts`:

```ts
export const PACKAGE_CATEGORIES = [
  "safari",
  "experience",
  "tour",
  "stay",
] as const
export type PackageCategory = (typeof PACKAGE_CATEGORIES)[number]

export const PACKAGE_CATEGORY_LABELS: Record<PackageCategory, string> = {
  safari: "Jeep safari",
  experience: "Village & food experience",
  tour: "Day tour",
  stay: "Accommodation",
}

export const PRICE_CURRENCIES = ["USD", "LKR"] as const
export type PriceCurrency = (typeof PRICE_CURRENCIES)[number]

export const PRICE_UNITS = ["per jeep", "per person", "per group"] as const
export type PriceUnit = (typeof PRICE_UNITS)[number]
```

In `lib/types.ts` import those three arrays and extend `packageSchema` (keep the existing fields; add after `images`, then chain the refinement):

```ts
	category: z.enum(PACKAGE_CATEGORIES).nullable().optional(),
	sortOrder: z.number().int().min(0).max(999).nullable().optional(),
	priceFrom: z.number().positive().max(100_000).nullable().optional(),
	priceCurrency: z.enum(PRICE_CURRENCIES).nullable().optional(),
	priceUnit: z.enum(PRICE_UNITS).nullable().optional(),
	priceNote: z.string().trim().max(160).nullable().optional(),
}).superRefine((value, context) => {
	if (value.priceFrom == null) return;
	if (!value.priceCurrency) {
		context.addIssue({ code: "custom", path: ["priceCurrency"], message: "Choose a currency for the price" });
	}
	if (!value.priceUnit) {
		context.addIssue({ code: "custom", path: ["priceUnit"], message: "Choose what the price covers" });
	}
});
```

Run: `pnpm test lib/types.test.ts`
Expected: PASS.

- [ ] **Step 3: Persist and serialize**

`models/Package.ts`: import the arrays from `@/lib/package-catalog` and add. `null` is listed in each enum because Mongoose's enum validator rejects `null` otherwise.

```ts
		category: { type: String, enum: [...PACKAGE_CATEGORIES, null], default: null },
		sortOrder: { type: Number, default: null },
		priceFrom: { type: Number, default: null },
		priceCurrency: { type: String, enum: [...PRICE_CURRENCIES, null], default: null },
		priceUnit: { type: String, enum: [...PRICE_UNITS, null], default: null },
		priceNote: { type: String, default: null },
```

`lib/packages.ts`: add the six optional fields to `PublicPackage` (typed with the catalog types) and to `PackageDocument` (as `T | null`), then in `serializePackage`:

```ts
		name: packageItem.name.trim(),
		category: packageItem.category ?? undefined,
		sortOrder: packageItem.sortOrder ?? undefined,
		priceFrom: packageItem.priceFrom ?? undefined,
		priceCurrency: packageItem.priceCurrency ?? undefined,
		priceUnit: packageItem.priceUnit ?? undefined,
		priceNote: packageItem.priceNote?.trim() || undefined,
```

- [ ] **Step 4: Admin form**

In `app/admin/(dashboard)/packages/page.tsx`:

1. Extend the local `Package` type with the six fields as `T | null` (optional).
2. Add to both `defaultValues` and the non-editing `form.reset(...)`: `category: null, sortOrder: null, priceFrom: null, priceCurrency: null, priceUnit: null, priceNote: null`. In the editing `form.reset(...)` add `category: editingPackage.category ?? null` and the same pattern for the other five.
3. In `onSubmit`'s `JSON.stringify({...})` add `category: data.category ?? null, sortOrder: data.sortOrder ?? null, priceFrom: data.priceFrom ?? null, priceCurrency: data.priceCurrency ?? null, priceUnit: data.priceUnit ?? null, priceNote: data.priceNote?.trim() || null,`. Sending `null` (never omitting) is what lets the admin clear a value.
4. In the General tab, after the `duration` `FormField` and before the Next button, insert the markup below. It uses the existing `Select*`, `Input`, `FormField` imports; add `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from `@/components/ui/select` if missing, and the three arrays plus `PACKAGE_CATEGORY_LABELS` from `@/lib/package-catalog`.

```tsx
														<FormField
															control={form.control}
															name="category"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Category</FormLabel>
																	<Select
																		value={field.value ?? ""}
																		onValueChange={(value) => field.onChange(value || null)}
																	>
																		<FormControl>
																			<SelectTrigger>
																				<SelectValue placeholder="Choose a category" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{PACKAGE_CATEGORIES.map((category) => (
																				<SelectItem key={category} value={category}>
																					{PACKAGE_CATEGORY_LABELS[category]}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="sortOrder"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Display order (1 shows first)</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			min={0}
																			max={999}
																			step={1}
																			value={field.value ?? ""}
																			onChange={(event) =>
																				field.onChange(
																					event.target.value === "" ? null : Number(event.target.value)
																				)
																			}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
															<FormField
																control={form.control}
																name="priceFrom"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel>Price from (optional)</FormLabel>
																		<FormControl>
																			<Input
																				type="number"
																				min={0}
																				step="any"
																				placeholder="45"
																				value={field.value ?? ""}
																				onChange={(event) =>
																					field.onChange(
																						event.target.value === "" ? null : Number(event.target.value)
																					)
																				}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="priceCurrency"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel>Currency</FormLabel>
																		<Select
																			value={field.value ?? ""}
																			onValueChange={(value) => field.onChange(value || null)}
																		>
																			<FormControl>
																				<SelectTrigger>
																					<SelectValue placeholder="USD / LKR" />
																				</SelectTrigger>
																			</FormControl>
																			<SelectContent>
																				{PRICE_CURRENCIES.map((currency) => (
																					<SelectItem key={currency} value={currency}>
																						{currency}
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>
																		<FormMessage />
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="priceUnit"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel>Price covers</FormLabel>
																		<Select
																			value={field.value ?? ""}
																			onValueChange={(value) => field.onChange(value || null)}
																		>
																			<FormControl>
																				<SelectTrigger>
																					<SelectValue placeholder="per jeep" />
																				</SelectTrigger>
																			</FormControl>
																			<SelectContent>
																				{PRICE_UNITS.map((unit) => (
																					<SelectItem key={unit} value={unit}>
																						{unit}
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>
																		<FormMessage />
																	</FormItem>
																)}
															/>
														</div>
														<FormField
															control={form.control}
															name="priceNote"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Price note (optional)</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="Park tickets not included"
																			value={field.value ?? ""}
																			onChange={(event) => field.onChange(event.target.value || null)}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
```

5. `handleNextTab` validates the General tab fields by name. Add `"category", "sortOrder", "priceFrom", "priceCurrency", "priceUnit", "priceNote"` to that `form.trigger([...])` list so price errors surface before moving tabs.

- [ ] **Step 5: Verify**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: tests PASS, typecheck clean, no new lint errors.
Manual (dev DB): in `/admin/packages` set category "Jeep safari", order 1, price 45 USD per jeep on one package, then save. Reopen it: the values persist. Clear the price, then save and reopen: the price is empty. Create a package without touching the new fields: it saves.

- [ ] **Step 6: Commit**

```bash
git add lib/package-catalog.ts lib/types.ts lib/types.test.ts models/Package.ts lib/packages.ts "app/admin/(dashboard)/packages/page.tsx"
git commit -m "feat: add optional category, display order, and price fields to packages"
```

---

### Task 4: Safaris first, and related packages that are actually related

Fixes audit H5/M4: packages sort newest-first, and every package page shows the same three newest packages.

**Files:**
- Modify: `lib/package-catalog.ts`
- Create: `lib/package-catalog.test.ts`
- Modify: `lib/packages.ts` (`getPackages`)
- Modify: `app/(main)/packages/[id]/page.tsx:81-83`

**Interfaces:**
- Consumes: `PackageCategory` (Task 3).
- Produces: `sortPackages<T extends OrderablePackage>(items: readonly T[]): T[]` and `selectRelatedPackages<T extends OrderablePackage>(current: T, all: readonly T[], limit?: number): T[]`, where `OrderablePackage = { _id: string; category?: PackageCategory; sortOrder?: number; createdAt?: string }`.

- [ ] **Step 1: Failing tests**

Create `lib/package-catalog.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  selectRelatedPackages,
  sortPackages,
  type OrderablePackage,
} from "./package-catalog"

const item = (
  _id: string,
  extra: Partial<OrderablePackage> = {}
): OrderablePackage => ({
  _id,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...extra,
})

describe("sortPackages", () => {
  it("orders by sortOrder, unordered items last", () => {
    const sorted = sortPackages([
      item("unordered"),
      item("second", { sortOrder: 2 }),
      item("first", { sortOrder: 1 }),
    ])
    expect(sorted.map((p) => p._id)).toEqual(["first", "second", "unordered"])
  })

  it("breaks ties newest first", () => {
    const sorted = sortPackages([
      item("older", { createdAt: "2025-01-01T00:00:00.000Z" }),
      item("newer", { createdAt: "2026-01-01T00:00:00.000Z" }),
    ])
    expect(sorted.map((p) => p._id)).toEqual(["newer", "older"])
  })

  it("does not mutate its input", () => {
    const input = [item("b", { sortOrder: 2 }), item("a", { sortOrder: 1 })]
    sortPackages(input)
    expect(input.map((p) => p._id)).toEqual(["b", "a"])
  })
})

describe("selectRelatedPackages", () => {
  const minneriya = item("minneriya", { category: "safari", sortOrder: 1 })
  const all = [
    item("polonnaruwa", { category: "tour", sortOrder: 6 }),
    minneriya,
    item("village", { category: "experience", sortOrder: 4 }),
    item("kaudulla", { category: "safari", sortOrder: 2 }),
    item("hurulu", { category: "safari", sortOrder: 3 }),
  ]

  it("prefers the same category and never includes the current package", () => {
    expect(selectRelatedPackages(minneriya, all).map((p) => p._id)).toEqual([
      "kaudulla",
      "hurulu",
      "village",
    ])
  })

  it("falls back to display order when the package has no category", () => {
    const loose = item("loose")
    expect(
      selectRelatedPackages(loose, [loose, ...all], 2).map((p) => p._id)
    ).toEqual(["minneriya", "kaudulla"])
  })

  it("returns an empty list when nothing else exists", () => {
    expect(selectRelatedPackages(minneriya, [minneriya])).toEqual([])
  })
})
```

Run: `pnpm test lib/package-catalog.test.ts`
Expected: FAIL, `sortPackages` is not exported.

- [ ] **Step 2: Implement**

Append to `lib/package-catalog.ts`:

```ts
export interface OrderablePackage {
  _id: string
  category?: PackageCategory
  sortOrder?: number
  createdAt?: string
}

export function sortPackages<T extends OrderablePackage>(
  items: readonly T[]
): T[] {
  return [...items].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.POSITIVE_INFINITY
    const orderB = b.sortOrder ?? Number.POSITIVE_INFINITY
    if (orderA !== orderB) return orderA - orderB
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  })
}

export function selectRelatedPackages<T extends OrderablePackage>(
  current: T,
  all: readonly T[],
  limit = 3
): T[] {
  const others = sortPackages(all.filter((p) => p._id !== current._id))
  const sameCategory = current.category
    ? others.filter((p) => p.category === current.category)
    : []
  const rest = others.filter((p) => !sameCategory.includes(p))
  return [...sameCategory, ...rest].slice(0, limit)
}
```

Run: `pnpm test lib/package-catalog.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 3: Use it**

`lib/packages.ts` `getPackages`: `return sortPackages(packages.map(serializePackage));` (import from `@/lib/package-catalog`).

`app/(main)/packages/[id]/page.tsx`: replace the `.filter(...).slice(0, 3)` chain with

```ts
  const relatedPackages = selectRelatedPackages(packageData, packages)
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

```bash
git add lib/package-catalog.ts lib/package-catalog.test.ts lib/packages.ts "app/(main)/packages/[id]/page.tsx"
git commit -m "feat: order packages by display order and relate them by category"
```

---

### Task 5: Titles, descriptions and robots that don't break

Fixes audit M3 plus the 404 robots conflict: package titles miss the brand, descriptions are `slice(0,160)` cut mid-word, and 404 pages emit both `noindex` and `index, follow`.

**Files:**
- Create: `lib/seo.ts`
- Create: `lib/seo.test.ts`
- Modify: `app/(main)/packages/[id]/page.tsx` (`generateMetadata`)
- Modify: `app/layout.tsx` (`metadata.robots`)

**Interfaces:**
- Produces: `truncateAtWord(text: string, max?: number): string`, `buildPackageTitle(name: string): string`.

- [ ] **Step 1: Failing tests**

Create `lib/seo.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildPackageTitle, truncateAtWord } from "./seo"

const long =
  "Embark on a private jeep safari through Hurulu Eco Park, where herds of wild elephants gather near the reservoir and our local guide explains their behaviour in detail."

describe("truncateAtWord", () => {
  it("returns short text unchanged", () => {
    expect(truncateAtWord("Private safari.", 160)).toBe("Private safari.")
  })

  it("collapses whitespace and newlines", () => {
    expect(truncateAtWord("Private\n  safari", 160)).toBe("Private safari")
  })

  it("cuts at a word boundary with an ellipsis within the limit", () => {
    const result = truncateAtWord(long, 120)
    expect(result.length).toBeLessThanOrEqual(120)
    expect(result.endsWith("…")).toBe(true)
    const kept = result.slice(0, -1)
    expect(long.startsWith(`${kept} `) || long.startsWith(`${kept},`)).toBe(
      true
    )
  })

  it("does not leave trailing punctuation before the ellipsis", () => {
    expect(truncateAtWord("Minneriya, Kaudulla, Hurulu, Habarana", 22)).toBe(
      "Minneriya, Kaudulla…"
    )
  })

  it("hard-cuts a single enormous word", () => {
    const result = truncateAtWord("a".repeat(300), 50)
    expect(result).toHaveLength(50)
  })
})

describe("buildPackageTitle", () => {
  it("adds the brand and cleans stray whitespace", () => {
    expect(buildPackageTitle("  Habarana Cottages and Rooms ")).toBe(
      "Habarana Cottages and Rooms | Ceylon Safari"
    )
  })
})
```

Run: `pnpm test lib/seo.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement**

Create `lib/seo.ts`:

```ts
import { siteConfig } from "@/config/site"

const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ").trim()

/** Shorten copy for meta descriptions without ending mid-word. */
export function truncateAtWord(text: string, max = 160): string {
  const clean = collapseWhitespace(text)
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut
  return `${base.replace(/[\s,;:.\-–]+$/, "")}…`
}

export function buildPackageTitle(name: string): string {
  return `${collapseWhitespace(name)} | ${siteConfig.name}`
}
```

Run: `pnpm test lib/seo.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 3: Use it**

`app/(main)/packages/[id]/page.tsx` `generateMetadata`:

```ts
  const description = truncateAtWord(packageData.description)
  const title = buildPackageTitle(packageData.name)
```

and set `title: { absolute: title }`, `openGraph.title: title`, `twitter.title: title`. The nested `packages/layout.tsx` title string resets the root template, which is why the brand was missing; `absolute` sidesteps the template chain explicitly.

`app/layout.tsx`: replace the `robots` object with the directives that don't conflict with Next's automatic `noindex` on 404s. Index/follow is the default and does not need stating.

```ts
  robots: {
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
```

Pages that need `noindex` (`/review`, `/thank-you`, filtered `/blogs`, missing packages) already set it explicitly. Confirm with `grep -rn "index: false" app`.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean. HTML checks happen in Task 12.

```bash
git add lib/seo.ts lib/seo.test.ts "app/(main)/packages/[id]/page.tsx" app/layout.tsx
git commit -m "fix: branded package titles, word-safe descriptions, single robots directive"
```

---

### Task 6: FAQ renders the right set, fully, on the server

Fixes audit M1/M2: `usePathname()` picks the wrong set during prerender, closed answers are missing from HTML, and the cancellation answer is an unfinished sentence.

**Files:**
- Create: `components/common/faq-data.ts`
- Create: `components/common/faq-section.test.tsx`
- Modify: `components/common/faq-section.tsx`
- Modify: `app/(main)/page.tsx`, `app/(main)/packages/page.tsx`, `app/(main)/book-now/page.tsx`, `app/(main)/contact/page.tsx` (pass `variant`)

**Interfaces:**
- Produces: `type FaqVariant = "safari" | "booking"`, `getFaqs(variant: FaqVariant): ReadonlyArray<{ question: string; answer: string }>`, `FAQ_SUBTITLES: Record<FaqVariant, string>`, and `<FAQSection variant={...} />`.

- [ ] **Step 1: Failing tests**

Create `components/common/faq-section.test.tsx`:

```tsx
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

  it("renders every answer into server HTML", () => {
    const html = decode(renderToStaticMarkup(<FAQSection variant={variant} />))
    for (const faq of getFaqs(variant)) {
      expect(html).toContain(faq.answer)
    }
  })
})

it("never promises a cancellation policy the owner has not confirmed", () => {
  const answer = getFaqs("booking").find((faq) =>
    faq.question.toLowerCase().includes("cancellation")
  )?.answer
  expect(answer).toBeDefined()
  expect(answer).not.toMatch(/refund|free cancellation|non-refundable/i)
})
```

Run: `pnpm test components/common/faq-section.test.tsx`
Expected: FAIL, `./faq-data` not found.

- [ ] **Step 2: Extract the data**

Create `components/common/faq-data.ts`. Move `safariFAQs` and `bookingFAQs` verbatim from `faq-section.tsx`, except the cancellation answer, then add:

```ts
export type FaqVariant = "safari" | "booking"

export interface Faq {
  question: string
  answer: string
}

// safariFAQs and bookingFAQs arrays moved here unchanged, except:
//   cancellation answer →
//   "Cancellation terms depend on the tour and the date. Message us on WhatsApp before you book and we will confirm them in writing."

const FAQS: Record<FaqVariant, readonly Faq[]> = {
  safari: safariFAQs,
  booking: bookingFAQs,
}

export const FAQ_SUBTITLES: Record<FaqVariant, string> = {
  safari: "Find answers to common questions about our safari and tour packages",
  booking: "Find answers to common questions about contacting and booking with us",
}

export function getFaqs(variant: FaqVariant): readonly Faq[] {
  return FAQS[variant]
}
```

(When moving the arrays, write them out in full as `const safariFAQs: readonly Faq[] = [...]` and `const bookingFAQs: readonly Faq[] = [...]`. The comment above only marks the single changed string.)

- [ ] **Step 3: Rewrite the component**

Replace `components/common/faq-section.tsx` with:

```tsx
"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import SectionHeading from "@/components/ui/section-heading"

import { FAQ_SUBTITLES, getFaqs, type FaqVariant } from "./faq-data"

export default function FAQSection({ variant }: { variant: FaqVariant }) {
  const faqs = getFaqs(variant)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle={FAQ_SUBTITLES[variant]}
        />
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          <Accordion
            type="single"
            defaultValue="item-1"
            collapsible
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <AccordionItem value={`item-${index + 1}`}>
                  <AccordionTrigger className="p-4 font-sans text-sm sm:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  {/* forceMount keeps closed answers in the HTML (Radix adds `hidden`). */}
                  <AccordionContent forceMount className="p-4 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
```

Call sites: `app/(main)/page.tsx` and `app/(main)/packages/page.tsx` get `<FAQSection variant="safari" />`; `book-now/page.tsx` and `contact/page.tsx` get `<FAQSection variant="booking" />`.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean. If Radix omits closed content despite `forceMount`, stop and report rather than hiding it with CSS; the test catches it.

```bash
git add components/common/faq-data.ts components/common/faq-section.tsx components/common/faq-section.test.tsx "app/(main)/page.tsx" "app/(main)/packages/page.tsx" "app/(main)/book-now/page.tsx" "app/(main)/contact/page.tsx"
git commit -m "fix: server-render the correct FAQ set with every answer"
```

---

### Task 7: Redirects as tested config

Track E. Consolidates duplicate content and recovers dead URLs. **Owner-side prerequisites** (the developer does these in admin/Sanity at deploy time):
- set `noIndex` or delete the two Minneriya posts;
- delete the `explore-sri-lanka-…` package so it leaves the listing and the sitemap.

**Files:**
- Create: `config/redirects.ts`
- Create: `config/redirects.test.ts`
- Modify: `next.config.ts` (`redirects()`)

**Interfaces:**
- Produces: `contentRedirects: PermanentRedirect[]`, `legacyHostRedirects(siteUrl: string): PermanentRedirect[]`.

- [ ] **Step 1: Failing tests**

Create `config/redirects.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { contentRedirects, legacyHostRedirects } from "./redirects"

describe("contentRedirects", () => {
  it("has unique sources", () => {
    const sources = contentRedirects.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it("never chains: no destination is also a source", () => {
    const sources = new Set(contentRedirects.map((r) => r.source))
    for (const redirect of contentRedirects) {
      expect(sources.has(redirect.destination)).toBe(false)
    }
  })

  it("is permanent and site-relative", () => {
    for (const redirect of contentRedirects) {
      expect(redirect.permanent).toBe(true)
      expect(redirect.destination.startsWith("/")).toBe(true)
    }
  })

  it("recovers the deleted Minneriya + Kaudulla package URL", () => {
    expect(
      contentRedirects.find(
        (r) =>
          r.source ===
          "/packages/habarana-safari-tour-minneriya-and-kaudulla-nationalpark"
      )?.destination
    ).toBe("/packages/minneriya-national-park-safari")
  })
})

describe("legacyHostRedirects", () => {
  it("sends both former hosts to the same path on the new origin", () => {
    const redirects = legacyHostRedirects("https://www.ceylonsafari.com")
    expect(redirects.map((r) => r.has?.[0]?.value)).toEqual([
      "travelhabarana.com",
      "www.travelhabarana.com",
    ])
    for (const redirect of redirects) {
      expect(redirect.source).toBe("/:path*")
      expect(redirect.destination).toBe("https://www.ceylonsafari.com/:path*")
      expect(redirect.permanent).toBe(true)
    }
  })
})
```

Run: `pnpm test config/redirects.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement**

Create `config/redirects.ts`:

```ts
export interface PermanentRedirect {
  source: string
  destination: string
  permanent: true
  has?: Array<{ type: "host"; value: string }>
}

const to = (source: string, destination: string): PermanentRedirect => ({
  source,
  destination,
  permanent: true,
})

export const contentRedirects: PermanentRedirect[] = [
  ...[
    "habarana-safari-jeep",
    "habarana-elephant-jeep-safari",
    "habaranaelephantjeepsafari",
  ].map((slug) => to(`/blogs/${slug}`, "/blogs/habarana-jeep-safari")),
  to("/blogs/minneriya-national-park-jeep-safari", "/blogs/minneriya-jeep-safari"),
  to("/blogs/minneriya-jeep-safari-habarana", "/blogs/minneriya-jeep-safari"),
  to(
    "/packages/habarana-safari-tour-minneriya-and-kaudulla-nationalpark",
    "/packages/minneriya-national-park-safari"
  ),
  to(
    "/packages/explore-sri-lanka-a-complete-guide-to-every-city-tour",
    "/packages/srilankan-day-and-multi-day-tours"
  ),
]

const LEGACY_HOSTS = ["travelhabarana.com", "www.travelhabarana.com"] as const

export function legacyHostRedirects(siteUrl: string): PermanentRedirect[] {
  return LEGACY_HOSTS.map((host) => ({
    source: "/:path*",
    has: [{ type: "host", value: host }],
    destination: `${siteUrl}/:path*`,
    permanent: true,
  }))
}
```

In `next.config.ts` replace the body of `redirects()` with:

```ts
    return [...contentRedirects, ...legacyHostRedirects(siteConfig.url)]
```

(import both from `./config/redirects`).

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm typecheck`
Expected: PASS / clean.

```bash
git add config/redirects.ts config/redirects.test.ts next.config.ts
git commit -m "feat: consolidate duplicate safari pages with permanent redirects"
```

---

### Task 8: WhatsApp and call actions everywhere a visitor decides

Audit H4 + C. WhatsApp becomes the primary CTA, prefilled per package; phone numbers become `tel:` links; every tap carries Umami attributes.

**Files:**
- Create: `lib/contact-links.ts`, `lib/contact-links.test.ts`
- Create: `lib/analytics.ts`, `lib/analytics.test.ts`
- Create: `components/common/contact-actions.tsx`, `components/common/contact-actions.test.tsx`
- Modify: `config/site.ts` (remove `links.whatsapp`, add `reviews`)
- Modify: `components/home/hero-section.tsx`, `app/(main)/packages/[id]/package-details.tsx`, `app/(main)/blogs/[slug]/page.tsx`, `app/(main)/contact/page.tsx`, `app/(main)/thank-you/page.tsx`, `components/ui/whatsapp-button.tsx`, `components/layout/navbar.tsx`, `components/layout/footer.tsx`

**Interfaces:**
- Produces:
  - `buildWhatsAppUrl(options?: { packageName?: string }): string`, `TEL_HREF: string`
  - `type AnalyticsEvent = "whatsapp_click" | "tel_click" | "book_now_click" | "inquiry_submitted"`, `type AnalyticsProps = Record<string, string | number>`
  - `trackAttrs(event: AnalyticsEvent, props?: AnalyticsProps): Record<string, string>`, `trackEvent(event: AnalyticsEvent, props?: AnalyticsProps): void`
  - `<ContactActions placement: string; packageName?: string; className?: string />`
  - `siteConfig.reviews: { rating: number; count: number; source: "Google"; url: string }`

- [ ] **Step 1: Failing tests for the pure helpers**

Create `lib/contact-links.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildWhatsAppUrl, TEL_HREF } from "./contact-links"

const messageOf = (url: string) => new URL(url).searchParams.get("text") ?? ""

describe("buildWhatsAppUrl", () => {
  it("targets the business number without a plus sign", () => {
    expect(buildWhatsAppUrl().startsWith("https://wa.me/94766675883?text=")).toBe(
      true
    )
  })

  it("prefills a general enquiry with blanks for the visitor", () => {
    const message = messageOf(buildWhatsAppUrl())
    expect(message).toContain("Ceylon Safari")
    expect(message).toMatch(/Date:/)
    expect(message).toMatch(/People:/)
    expect(message).toMatch(/Pickup hotel:/)
  })

  it("names the package, trimmed, and survives & and quotes", () => {
    const url = buildWhatsAppUrl({ packageName: ' Village "Food" & Cooking ' })
    expect(url).not.toContain("&text")
    expect(new URL(url).searchParams.getAll("text")).toHaveLength(1)
    expect(messageOf(url)).toContain('Village "Food" & Cooking')
    expect(messageOf(url)).not.toContain(' Village "Food" & Cooking ')
  })
})

it("TEL_HREF dials the E.164 number", () => {
  expect(TEL_HREF).toBe("tel:+94766675883")
})
```

Create `lib/analytics.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest"

import { parseUmamiWebsiteId, trackAttrs, trackEvent } from "./analytics"

describe("trackAttrs", () => {
  it("maps event and props to Umami data attributes", () => {
    expect(
      trackAttrs("whatsapp_click", { placement: "hero", package: "Hurulu" })
    ).toEqual({
      "data-umami-event": "whatsapp_click",
      "data-umami-event-placement": "hero",
      "data-umami-event-package": "Hurulu",
    })
  })

  it("rejects property keys Umami cannot express as attributes", () => {
    expect(() => trackAttrs("tel_click", { "Bad Key": "x" })).toThrow()
  })
})

describe("trackEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("is a no-op on the server", () => {
    expect(() => trackEvent("inquiry_submitted")).not.toThrow()
  })

  it("forwards to umami.track in the browser", () => {
    const track = vi.fn()
    vi.stubGlobal("window", { umami: { track } })
    trackEvent("inquiry_submitted", { package: "Hurulu" })
    expect(track).toHaveBeenCalledWith("inquiry_submitted", {
      package: "Hurulu",
    })
  })

  it("survives a blocked or missing tracker", () => {
    vi.stubGlobal("window", {})
    expect(() => trackEvent("tel_click")).not.toThrow()
  })

  it("swallows tracker errors", () => {
    vi.stubGlobal("window", {
      umami: {
        track: () => {
          throw new Error("blocked")
        },
      },
    })
    expect(() => trackEvent("tel_click")).not.toThrow()
  })
})

describe("parseUmamiWebsiteId", () => {
  it("accepts a UUID", () => {
    expect(parseUmamiWebsiteId(" 94db1cb1-74f4-4a40-ad6c-962362670409 ")).toBe(
      "94db1cb1-74f4-4a40-ad6c-962362670409"
    )
  })

  it.each([undefined, "", "not-a-uuid"])("rejects %s", (raw) => {
    expect(parseUmamiWebsiteId(raw)).toBeNull()
  })
})
```

Run: `pnpm test lib/contact-links.test.ts lib/analytics.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 2: Implement the helpers**

Create `lib/contact-links.ts`:

```ts
import { siteConfig } from "@/config/site"

const WHATSAPP_NUMBER = siteConfig.contact.phoneE164.replace(/^\+/, "")

export const TEL_HREF = `tel:${siteConfig.contact.phoneE164}`

export function buildWhatsAppUrl({
  packageName,
}: { packageName?: string } = {}): string {
  const subject = packageName?.trim()
    ? `I'd like to check availability for "${packageName.trim()}".`
    : "I'd like to ask about a safari."
  const text = [
    `Hi ${siteConfig.name}! ${subject}`,
    "Date: ",
    "People: ",
    "Pickup hotel: ",
  ].join("\n")

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
```

Create `lib/analytics.ts`:

```ts
export type AnalyticsEvent =
  | "whatsapp_click"
  | "tel_click"
  | "book_now_click"
  | "inquiry_submitted"

export type AnalyticsProps = Record<string, string | number>

declare global {
  interface Window {
    umami?: { track: (event: string, data?: AnalyticsProps) => void }
  }
}

const PROPERTY_KEY = /^[a-z0-9_]+$/

/** Umami tracks clicks on elements carrying these attributes; no JS needed. */
export function trackAttrs(
  event: AnalyticsEvent,
  props: AnalyticsProps = {}
): Record<string, string> {
  const attributes: Record<string, string> = { "data-umami-event": event }
  for (const [key, value] of Object.entries(props)) {
    if (!PROPERTY_KEY.test(key)) {
      throw new Error(`Invalid analytics property key: ${key}`)
    }
    attributes[`data-umami-event-${key}`] = String(value)
  }
  return attributes
}

/** For events that are not a click, e.g. a successful form submission. */
export function trackEvent(event: AnalyticsEvent, props?: AnalyticsProps) {
  if (typeof window === "undefined") return
  try {
    window.umami?.track(event, props)
  } catch {
    // Analytics must never break the page (ad-blockers, network errors).
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseUmamiWebsiteId(raw: string | undefined): string | null {
  const id = raw?.trim()
  return id && UUID.test(id) ? id : null
}
```

Run: `pnpm test lib/contact-links.test.ts lib/analytics.test.ts`
Expected: PASS.

- [ ] **Step 3: Failing component test**

Create `components/common/contact-actions.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ContactActions } from "./contact-actions"

describe("ContactActions", () => {
  const html = renderToStaticMarkup(
    <ContactActions placement="package" packageName="Hurulu Eco Park Safari" />
  )

  it("links WhatsApp with the package prefilled and tracks it", () => {
    expect(html).toContain('href="https://wa.me/94766675883?text=')
    expect(html).toContain(encodeURIComponent("Hurulu Eco Park Safari"))
    expect(html).toContain('data-umami-event="whatsapp_click"')
    expect(html).toContain('data-umami-event-placement="package"')
  })

  it("offers a tracked tel: link", () => {
    expect(html).toContain('href="tel:+94766675883"')
    expect(html).toContain('data-umami-event="tel_click"')
  })

  it("does not nest a button inside a link", () => {
    expect(html).not.toMatch(/<a[^>]*>\s*<button/)
  })
})
```

Run: `pnpm test components/common/contact-actions.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement the component**

Create `components/common/contact-actions.tsx`:

```tsx
import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { trackAttrs } from "@/lib/analytics"
import { buildWhatsAppUrl, TEL_HREF } from "@/lib/contact-links"
import { cn } from "@/lib/utils"

interface ContactActionsProps {
  placement: string
  packageName?: string
  className?: string
}

export function ContactActions({
  placement,
  packageName,
  className,
}: ContactActionsProps) {
  const whatsappProps = packageName
    ? { placement, package: packageName.trim() }
    : { placement }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <Button
        asChild
        size="lg"
        className="bg-[#25D366] text-white hover:bg-[#1ebe5b]"
      >
        <a
          href={buildWhatsAppUrl({ packageName })}
          target="_blank"
          rel="noopener noreferrer"
          {...trackAttrs("whatsapp_click", whatsappProps)}
        >
          <WhatsappLogo weight="fill" className="size-5" aria-hidden="true" />
          Ask on WhatsApp
        </a>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href={TEL_HREF} {...trackAttrs("tel_click", { placement })}>
          <Phone className="size-5" aria-hidden="true" />
          Call {siteConfig.contact.phone}
        </a>
      </Button>
    </div>
  )
}
```

Run: `pnpm test components/common/contact-actions.test.tsx`
Expected: PASS.

- [ ] **Step 5: Site config**

`config/site.ts`: delete `links.whatsapp` and add after `links`:

```ts
  // Google Business Profile rating shown as a trust line. Update when the
  // review count changes; never inflate it.
  reviews: {
    rating: 5,
    count: 27,
    source: "Google",
    url: "https://maps.app.goo.gl/jtjd3mUANDnH3rRu5",
  },
```

Run `pnpm typecheck`. Every remaining `siteConfig.links.whatsapp` is now a compile error. Fix each one as follows:
- `components/ui/whatsapp-button.tsx`: `href={buildWhatsAppUrl()}` plus `{...trackAttrs("whatsapp_click", { placement: "floating" })}`.
- `components/layout/footer.tsx:66`: `href={buildWhatsAppUrl()}` plus `{...trackAttrs("whatsapp_click", { placement: "footer" })}`. The existing footer `tel:` link (line 136) gains `{...trackAttrs("tel_click", { placement: "footer" })}`.
- `app/(main)/thank-you/page.tsx:44`: `href={buildWhatsAppUrl()}` plus `{...trackAttrs("whatsapp_click", { placement: "thank_you" })}`.
- `app/(main)/contact/page.tsx:94`: `href={buildWhatsAppUrl()}` plus `{...trackAttrs("whatsapp_click", { placement: "contact" })}`. Wrap the phone at line 97 in `<a href={TEL_HREF} {...trackAttrs("tel_click", { placement: "contact" })}>`.
- `components/home/hero-section.tsx:108` (social icon): `href={buildWhatsAppUrl()}` plus tracking with `placement: "hero_icon"`.

- [ ] **Step 6: Placements**

**Hero** (`components/home/hero-section.tsx`): replace the two-button `<div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">…</div>` with:

```tsx
            <ContactActions
              placement="hero"
              className="justify-center lg:justify-start"
            />
            <p className="mt-4 text-sm text-white/90">
              <a
                href={siteConfig.reviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                ★ {siteConfig.reviews.rating.toFixed(1)} ·{" "}
                {siteConfig.reviews.count} {siteConfig.reviews.source} reviews
              </a>
              <span aria-hidden="true"> · </span>
              <a href="#packages" className="underline-offset-4 hover:underline">
                View packages
              </a>
            </p>
```

Then remove the hero imports this leaves unused (`Link`, `Button`, `ArrowRight`), and import `ContactActions` from `@/components/common/contact-actions`.

**Package page** (`package-details.tsx`): in the booking card replace the `Book Now` `<Button asChild>…</Button>` and the paragraph under it with:

```tsx
							<ContactActions
								placement="package"
								packageName={packageData.name}
								className="sm:flex-col"
							/>
							<p className="mt-4 text-center text-sm text-gray-500">
								Prefer email?{" "}
								<Link
									href={`/book-now?packageId=${packageData._id}`}
									className="font-medium text-primary underline-offset-4 hover:underline"
									{...trackAttrs("book_now_click", { placement: "package" })}
								>
									Send an inquiry form
								</Link>
								. No payment needed to ask.
							</p>
```

In the "Need Help?" card, wrap the phone number in `<a href={TEL_HREF} {...trackAttrs("tel_click", { placement: "package_help" })}>`.

**Blog post** (`app/(main)/blogs/[slug]/page.tsx`): immediately before `{/* Comments Section */}` insert:

```tsx
        <section className="mx-auto mt-16 max-w-2xl rounded-xl border bg-gray-50 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Planning a safari from Habarana?</h2>
          <p className="mb-6 text-gray-600">
            Tell us your date and hotel and we will reply with availability and
            the current price.
          </p>
          <ContactActions placement="blog" className="justify-center" />
          <p className="mt-4 text-sm">
            <Link href="/packages" className="text-primary underline-offset-4 hover:underline">
              Compare all safari packages
            </Link>
          </p>
        </section>
```

**Navbar** (`components/layout/navbar.tsx`): wrap the mobile menu button in `<div className="flex items-center gap-4 lg:hidden">`. Put a call link before the button, and remove `lg:hidden` from the button itself:

```tsx
						<a
							href={TEL_HREF}
							aria-label={`Call ${siteConfig.name}`}
							className="text-2xl"
							{...trackAttrs("tel_click", { placement: "navbar" })}
						>
							<Phone className="text-current" />
						</a>
```

(`Phone` from `@phosphor-icons/react`). Both "Send Inquiry" links gain `{...trackAttrs("book_now_click", { placement: "navbar" })}`.

- [ ] **Step 7: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean / no new errors. `grep -rn "links.whatsapp" app components config` → no matches.

```bash
git add lib/contact-links.ts lib/contact-links.test.ts lib/analytics.ts lib/analytics.test.ts components/common/contact-actions.tsx components/common/contact-actions.test.tsx config/site.ts components/home/hero-section.tsx "app/(main)/packages/[id]/package-details.tsx" "app/(main)/blogs/[slug]/page.tsx" "app/(main)/contact/page.tsx" "app/(main)/thank-you/page.tsx" components/ui/whatsapp-button.tsx components/layout/navbar.tsx components/layout/footer.tsx
git commit -m "feat: make WhatsApp and click-to-call the primary, tracked contact paths"
```

---

### Task 9: Umami Cloud tracker + CSP + inquiry event

Audit C4. Adds counting without cookies or a consent banner.

**Setup (owner or developer, once):** create a free Umami Cloud account and add website `www.ceylonsafari.com`, then copy the website id (a UUID). In Vercel set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` for Production only, so previews don't pollute stats. `data-domains` also guards against that.

**Files:**
- Create: `config/security-headers.ts`, `config/security-headers.test.ts`
- Modify: `next.config.ts`
- Modify: `app/(main)/layout.tsx`
- Modify: `components/common/booking-form.tsx`

**Interfaces:**
- Consumes: `parseUmamiWebsiteId`, `trackEvent` (Task 8).
- Produces: `buildContentSecurityPolicy(options: { isDevelopment: boolean }): string`, `UMAMI_ORIGIN = "https://cloud.umami.is"`.

- [ ] **Step 1: Failing CSP test**

Create `config/security-headers.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildContentSecurityPolicy, UMAMI_ORIGIN } from "./security-headers"

const directive = (csp: string, name: string) =>
  csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `)) ?? ""

describe("buildContentSecurityPolicy", () => {
  const production = buildContentSecurityPolicy({ isDevelopment: false })

  it("lets the Umami script load and report", () => {
    expect(directive(production, "script-src")).toContain(UMAMI_ORIGIN)
    expect(directive(production, "connect-src")).toContain(UMAMI_ORIGIN)
  })

  it("keeps unsafe-eval out of production", () => {
    expect(production).not.toContain("'unsafe-eval'")
    expect(
      buildContentSecurityPolicy({ isDevelopment: true })
    ).toContain("'unsafe-eval'")
  })

  it("still forbids framing and plugins", () => {
    expect(production).toContain("frame-ancestors 'none'")
    expect(production).toContain("object-src 'none'")
  })
})
```

Run: `pnpm test config/security-headers.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement**

Create `config/security-headers.ts` by moving the `contentSecurityPolicy` array out of `next.config.ts` into:

```ts
export const UMAMI_ORIGIN = "https://cloud.umami.is"

export function buildContentSecurityPolicy({
  isDevelopment,
}: {
  isDevelopment: boolean
}): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://static.elfsight.com https://*.elfsightcdn.com https://*.sanity.io ${UMAMI_ORIGIN}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.sanity.io https://*.elfsight.com https://*.elfsightcdn.com",
    "font-src 'self' data:",
    `connect-src 'self' https://*.sanity.io wss://*.sanity.io https://api.cloudinary.com https://*.elfsight.com https://*.elfsightcdn.com ${UMAMI_ORIGIN}`,
    "frame-src 'self' https://*.sanity.io https://*.elfsight.com https://www.google.com https://maps.google.com",
    "media-src 'self' blob: https://cdn.sanity.io https://res.cloudinary.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}
```

In `next.config.ts` use `value: buildContentSecurityPolicy({ isDevelopment })` and delete the old array.

Run: `pnpm test config/security-headers.test.ts`
Expected: PASS.

- [ ] **Step 3: Load the tracker on public pages only**

`app/(main)/layout.tsx`. Admin pages live outside `(main)` and stay untracked.

```tsx
import Script from "next/script";
import { siteConfig } from "@/config/site";
import { parseUmamiWebsiteId } from "@/lib/analytics";
import { UMAMI_ORIGIN } from "@/config/security-headers";

const umamiWebsiteId = parseUmamiWebsiteId(
	process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
);
```

and inside the returned tree, after `<WhatsAppButton />`:

```tsx
			{umamiWebsiteId && (
				<Script
					src={`${UMAMI_ORIGIN}/script.js`}
					data-website-id={umamiWebsiteId}
					data-domains={new URL(siteConfig.url).hostname}
					strategy="afterInteractive"
				/>
			)}
```

Also change this layout's outer `<main className="flex-grow">` to `<div className="flex-grow">`. Every page already renders its own `<main>`, and nested `<main>` is invalid.

- [ ] **Step 4: Count successful inquiries**

`components/common/booking-form.tsx`: import `trackEvent` and, right after `toast.success(...)` in `onSubmit`, add:

```ts
			trackEvent("inquiry_submitted", {
				package:
					packages.find((option) => option._id === data.packageId)?.name ??
					"unknown",
			});
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.
Manual: `NEXT_PUBLIC_UMAMI_WEBSITE_ID=94db1cb1-74f4-4a40-ad6c-962362670409 pnpm build && pnpm start`, then open `/` in a browser. DevTools console shows no CSP violation for `cloud.umami.is`, and the Network tab shows `script.js` loaded. Without the variable the script tag is absent (`curl -s localhost:3000 | grep -c cloud.umami.is` → `0`).

```bash
git add config/security-headers.ts config/security-headers.test.ts next.config.ts "app/(main)/layout.tsx" components/common/booking-form.tsx
git commit -m "feat: add cookieless Umami analytics with inquiry conversion event"
```

---

### Task 10: Prices, Offer schema, and honest trust badges

Audit H3/M1. Shows "From US$X per jeep" once the admin fills it in, and removes claims nobody has confirmed.

**Files:**
- Create: `lib/pricing.ts`, `lib/pricing.test.ts`
- Modify: `components/ui/package-card.tsx`, `app/(main)/packages/page.tsx`, `components/home/packages-section.tsx` (pass price props)
- Modify: `app/(main)/packages/[id]/package-details.tsx` (price line, badges, group size)
- Modify: `app/(main)/packages/[id]/page.tsx` (Service `offers`)

**Interfaces:**
- Consumes: `PriceCurrency`, `PriceUnit` (Task 3); `PublicPackage` price fields.
- Produces: `interface PriceFields { priceFrom?: number; priceCurrency?: PriceCurrency; priceUnit?: PriceUnit }`, `formatPrice(price: PriceFields): string | null`, `buildOffer(price: PriceFields, url: string): Record<string, unknown> | undefined`.

- [ ] **Step 1: Failing tests**

Create `lib/pricing.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { buildOffer, formatPrice } from "./pricing"

describe("formatPrice", () => {
  it("formats USD per jeep", () => {
    expect(
      formatPrice({ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" })
    ).toBe("From US$45 per jeep")
  })

  it("groups LKR thousands", () => {
    expect(
      formatPrice({
        priceFrom: 12000,
        priceCurrency: "LKR",
        priceUnit: "per person",
      })
    ).toBe("From LKR 12,000 per person")
  })

  it("keeps meaningful decimals", () => {
    expect(
      formatPrice({ priceFrom: 17.5, priceCurrency: "USD", priceUnit: "per person" })
    ).toBe("From US$17.50 per person")
  })

  it.each([
    [{}],
    [{ priceFrom: 45 }],
    [{ priceFrom: 45, priceCurrency: "USD" as const }],
  ])("returns null when incomplete: %o", (price) => {
    expect(formatPrice(price)).toBeNull()
  })
})

describe("buildOffer", () => {
  const url = "https://www.ceylonsafari.com/packages/hurulu-eco-park-safari"

  it("builds a schema.org Offer", () => {
    expect(
      buildOffer({ priceFrom: 45, priceCurrency: "USD", priceUnit: "per jeep" }, url)
    ).toEqual({
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

- [ ] **Step 2: Implement**

Create `lib/pricing.ts`:

```ts
import type { PriceCurrency, PriceUnit } from "@/lib/package-catalog"

export interface PriceFields {
  priceFrom?: number
  priceCurrency?: PriceCurrency
  priceUnit?: PriceUnit
}

const CURRENCY_PREFIX: Record<PriceCurrency, string> = {
  USD: "US$",
  LKR: "LKR ",
}

export function formatPrice(price: PriceFields): string | null {
  const { priceFrom, priceCurrency, priceUnit } = price
  if (priceFrom == null || !priceCurrency || !priceUnit) return null

  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(priceFrom) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(priceFrom)

  return `From ${CURRENCY_PREFIX[priceCurrency]}${amount} ${priceUnit}`
}

export function buildOffer(
  price: PriceFields,
  url: string
): Record<string, unknown> | undefined {
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

Run: `pnpm test lib/pricing.test.ts`
Expected: PASS.

- [ ] **Step 3: Render prices**

`components/ui/package-card.tsx`:
- Add the optional `priceFrom`, `priceCurrency` and `priceUnit` props.
- Compute `const price = formatPrice({ priceFrom, priceCurrency, priceUnit })`.
- Replace the fixed "Contact us for pricing & availability" text with ``{price ?? "Contact us for pricing & availability"}``, and use `font-semibold text-gray-900` when a price exists.
- Replace the inner `<Button variant={"link"}>View Details…</Button>` with `<span className="inline-flex items-center font-medium text-primary">View details <ArrowRight size={16} className="ml-1 transition-all group-hover:ml-2" /></span>`. The whole card is already a link, so a nested button is invalid.
- Drop the unused `Button` import.

Pass `priceFrom={packageItem.priceFrom} priceCurrency={packageItem.priceCurrency} priceUnit={packageItem.priceUnit}` from `app/(main)/packages/page.tsx` and `components/home/packages-section.tsx`.

`package-details.tsx` booking card:
- Directly under the `Book This Package` heading add `{formatPrice(packageData) && (<p className="mb-1 text-2xl font-bold text-gray-900">{formatPrice(packageData)}</p>)}` and `{packageData.priceNote && <p className="mb-4 text-sm text-gray-600">{packageData.priceNote}</p>}`.
- Render the "Group Size / 1-6 people per jeep" row only when `packageData.category === "safari"`.
- Replace the two badges "Free Cancellation" and "Instant Confirmation" with "No payment to enquire" and "Reply within 24 hours".

`app/(main)/packages/[id]/page.tsx`: in the `Service` object add `offers: buildOffer(packageData, canonicalUrl),`. `JSON.stringify` drops it when `undefined`.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: PASS / clean.
Manual (dev DB, price set in Task 3): the card and the package page show "From US$45 per jeep", and the page's `Service` JSON-LD contains `"offers"`. A package without a price shows the fallback text and has no `offers`.

```bash
git add lib/pricing.ts lib/pricing.test.ts components/ui/package-card.tsx "app/(main)/packages/page.tsx" components/home/packages-section.tsx "app/(main)/packages/[id]/package-details.tsx" "app/(main)/packages/[id]/page.tsx"
git commit -m "feat: show optional from-prices with Offer schema and honest trust badges"
```

---

### Task 11: Visible without JavaScript; valid interactive markup

Audit M5 + low items. The booking card, the form and the contact card mount at `opacity: 0`, and several CTAs nest `<button>` inside `<a>`.

**Files:**
- Create: `components/common/booking-form.test.tsx`
- Modify: `components/common/booking-form.tsx`, `app/(main)/packages/[id]/package-details.tsx`, `app/(main)/contact/page.tsx`
- Modify: `components/home/cta-banner-section.tsx`, `components/home/plan-visit-section.tsx`, `components/home/featured-blogs-section.tsx`

- [ ] **Step 1: Failing test**

Create `components/common/booking-form.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import BookingForm from "./booking-form"

describe("BookingForm server render", () => {
  const html = renderToStaticMarkup(
    <BookingForm packages={[{ _id: "a".repeat(24), name: "Hurulu" }]} />
  )

  it("is visible before JavaScript runs", () => {
    expect(html).not.toMatch(/opacity:\s*0/)
  })

  it("renders the form fields", () => {
    expect(html).toContain("Full Name")
    expect(html).toContain("Preferred Date")
  })
})
```

Run: `pnpm test components/common/booking-form.test.tsx`
Expected: FAIL on "is visible before JavaScript runs". framer-motion SSR emits `opacity:0`.

- [ ] **Step 2: Remove entrance animations from conversion surfaces**

- `booking-form.tsx`: replace the outer `<motion.div initial=… animate=… transition=… className="bg-white rounded-xl shadow-lg p-6 md:p-8">` with `<div className="bg-white rounded-xl shadow-lg p-6 md:p-8">`, and its closing tag. Delete the `framer-motion` import.
- `package-details.tsx`: the booking-card `motion.div` becomes `div` with the same className. In related cards, each `motion.div` becomes `<div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-md transition-transform hover:-translate-y-1">`. The inner `motion.div` + `<Button variant="link">` becomes `<span className="flex justify-end font-medium text-primary">View details <ArrowRight size={16} className="ml-1" /></span>`. Delete the `framer-motion` import and the now-unused `Button` import only if nothing else uses it (the header icon buttons still do, so keep it).
- `app/(main)/contact/page.tsx:64`: `motion.div` becomes `div`; delete the `framer-motion` import.

Run: `pnpm test components/common/booking-form.test.tsx`
Expected: PASS.

- [ ] **Step 3: Fix nested interactive elements**

In each spot, turn `<Link href="…" className="group"><Button …>children</Button></Link>` into `<Button asChild …><Link href="…" className="group">children</Link></Button>`, keeping every existing prop:

- `components/home/cta-banner-section.tsx:33-34`
- `components/home/plan-visit-section.tsx:92-96` (both links)
- `components/home/featured-blogs-section.tsx:38-39`

`cta-banner-section.tsx` and `plan-visit-section.tsx` point at `/book-now`: add `{...trackAttrs("book_now_click", { placement: "cta_banner" })}` / `{ placement: "plan_visit" }` to those `Link`s.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint && grep -rn "framer-motion" components/common/booking-form.tsx "app/(main)/contact/page.tsx" "app/(main)/packages/[id]/package-details.tsx"`
Expected: PASS / clean / no grep output.

```bash
git add components/common/booking-form.tsx components/common/booking-form.test.tsx "app/(main)/packages/[id]/package-details.tsx" "app/(main)/contact/page.tsx" components/home/cta-banner-section.tsx components/home/plan-visit-section.tsx components/home/featured-blogs-section.tsx
git commit -m "fix: render conversion surfaces visibly without JS and fix nested controls"
```

---

### Task 12: Whole-branch verification against a production build

- [ ] **Step 1: Gates**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
Expected: all green. The build uses the dev DB via `.env.local`.

- [ ] **Step 2: HTML checks on `pnpm start`**

With `pnpm start` running on :3000:

```bash
B=http://localhost:3000
PKG=$(curl -s $B/packages | grep -oE 'href="/packages/[a-z0-9-]+"' | head -1 | sed 's/href="//;s/"//')
curl -s $B/ | grep -c 'data-umami-event="whatsapp_click"'            # ≥ 2 (hero + floating)
curl -s $B/ | grep -cE '<a[^>]*>\s*<button'                          # 0
curl -s $B$PKG | grep -oE '<title>[^<]+</title>'                     # ends "| Ceylon Safari</title>"
curl -s $B$PKG | grep -oE '<meta name="description" content="[^"]+"' # no mid-word cut
curl -s $B$PKG | grep -c 'opacity:0'                                 # 0
curl -s $B/book-now | grep -c 'opacity:0'                            # 0
curl -s $B/definitely-missing | grep -oE '<meta name="robots"[^>]*>' # exactly one, noindex
curl -sI $B/blogs/minneriya-jeep-safari-habarana | grep -iE '^(HTTP|location)'  # 308 → /blogs/minneriya-jeep-safari
curl -sI $B/packages/habarana-safari-tour-minneriya-and-kaudulla-nationalpark | grep -iE '^(HTTP|location)'  # 308 → minneriya package
curl -s $B/ | grep -c 'Cancellation terms depend'                   # 0 on home (safari set)
curl -s $B/contact | grep -c 'Cancellation terms depend'            # 1
```

Any mismatch is a defect: go back to the owning task, not a patch here.

- [ ] **Step 3: Mobile smoke test**

Open `/`, a package page and `/book-now` at 390 px wide in a browser, and check each of these:
- the WhatsApp button opens `wa.me` with the prefilled text;
- Call opens the dialer;
- the calendar allows **today**;
- the console shows no CSP errors;
- there is no horizontal overflow.

- [ ] **Step 4: Hand-off note**

Report to the user, with the evidence above:
- the deploy checklist: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in Vercel Production;
- the owner-side admin/Sanity edits from Task 7;
- how to set prices and categories in `/admin/packages`.

## Out of scope for this plan (tracked in the audit)

- **Stale sitemap root cause.** Needs Sanity webhook delivery logs. `SANITY_WEBHOOK_SECRET` in Vercel was last updated 2025-06-16. Diagnose with superpowers:systematic-debugging before touching `app/sitemap.ts`.
- **Vercel bot traffic and plan.** Firewall rulesets, `robots.txt` crawler policy, and the Hobby commercial-use issue are separate decisions for the user.
- **Track D.** Rich package landing pages (itinerary, pickup areas, best time, FAQs per package) wait for the owner's facts.
