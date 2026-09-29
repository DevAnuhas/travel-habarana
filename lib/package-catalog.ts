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

export interface OrderablePackage {
  _id: string
  category?: PackageCategory
  sortOrder?: number
  createdAt?: string
}

/** Admin display order first (0 is a real slot); unordered items last, newest first. */
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

// Explicit keyword fallback for packages whose admin category is unset
// (every live package as of 29 Sep 2026). Order matters: "village-experience-tour"
// must be an experience, not a tour. The admin's category always wins.
const CATEGORY_RULES: ReadonlyArray<readonly [RegExp, PackageCategory]> = [
  [/safari/, "safari"],
  [/village|cooking|culinary/, "experience"],
  [/cottage|room|stay|hotel/, "stay"],
  [/tour/, "tour"],
]

export function inferCategory(
  slug: string,
  name: string
): PackageCategory | undefined {
  const haystack = `${slug} ${name}`.toLowerCase()
  return CATEGORY_RULES.find(([pattern]) => pattern.test(haystack))?.[1]
}

// Neutral intros: they name the category, never claim what it includes.
export const CATEGORY_SECTIONS = [
  {
    key: "safari",
    title: "Jeep safaris",
    intro:
      "Jeep safaris to Minneriya, Kaudulla and Hurulu Eco Park from Habarana.",
  },
  {
    key: "experience",
    title: "Village & food experiences",
    intro: "Village and food experiences around Habarana.",
  },
  {
    key: "tour",
    title: "Day tours",
    intro:
      "Day tours to the ancient cities and temples of the Cultural Triangle.",
  },
  { key: "stay", title: "Stays", intro: "Places to stay in Habarana." },
  {
    key: "other",
    title: "More tours",
    intro: "Other experiences around Habarana.",
  },
] as const satisfies ReadonlyArray<{
  key: PackageCategory | "other"
  title: string
  intro: string
}>

export function groupPackagesByCategory<T extends OrderablePackage>(
  items: readonly T[]
) {
  const sorted = sortPackages(items)
  return CATEGORY_SECTIONS.map((section) => ({
    ...section,
    items: sorted.filter((p) => (p.category ?? "other") === section.key),
  })).filter((group) => group.items.length > 0)
}
