import type { PriceCurrency, PriceUnit } from "@/lib/package-catalog"

export const PRICE_ON_REQUEST = "Price on request"

export interface PriceFields {
  priceFrom?: number
  priceCurrency?: PriceCurrency
  priceUnit?: PriceUnit
}

const CURRENCY_PREFIX: Record<PriceCurrency, string> = {
  USD: "US$",
  LKR: "LKR ",
}

export function formatPrice({
  priceFrom,
  priceCurrency,
  priceUnit,
}: PriceFields): string | null {
  if (priceFrom == null || !priceCurrency || !priceUnit) return null
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(priceFrom) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(priceFrom)
  return `From ${CURRENCY_PREFIX[priceCurrency]}${amount} ${priceUnit}`
}

/** Offer from price data only. No availability: nothing in the data establishes it. */
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
    description: label,
  }
}
