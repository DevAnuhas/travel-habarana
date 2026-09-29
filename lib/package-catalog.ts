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
