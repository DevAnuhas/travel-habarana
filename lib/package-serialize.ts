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

/** Stored shape of a photo description (URLs can't be Mongo object keys). */
export interface ImageAlt {
  src: string
  alt: string
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
  /** Image URL → description, only for images still in `images`. */
  imageAlts?: Record<string, string>
  itinerary?: ItineraryStep[]
  faqs?: PackageFaq[]
  season?: Season
}

type Nullable<T> = { [K in keyof T]?: T[K] | null }

export interface PackageDocument
  extends Nullable<
    Omit<
      PublicPackage,
      "_id" | "createdAt" | "updatedAt" | "itinerary" | "season" | "imageAlts"
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
  previousSlugs?: string[] | null
  itinerary?: Array<{
    time?: string | null
    title: string
    detail?: string | null
  }> | null
  season?: { peak?: number[] | null; good?: number[] | null } | null
  imageAlts?: ImageAlt[] | null
}

const text = (value?: string | null) => value?.trim() || undefined
const list = <T>(value?: T[] | null) =>
  value && value.length > 0 ? value : undefined

/** URL-keyed so reordering or removing photos can never shift a description onto another photo. */
function imageAltMap(
  images: string[],
  alts?: ImageAlt[] | null
): Record<string, string> | undefined {
  const current = new Set(images)
  const map: Record<string, string> = {}
  for (const { src, alt } of alts ?? []) {
    if (current.has(src) && alt.trim()) map[src] = alt.trim()
  }
  return Object.keys(map).length ? map : undefined
}

export function serializePackage(doc: PackageDocument): PublicPackage {
  const images = doc.images ?? []
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
    images,
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
    imageAlts: imageAltMap(images, doc.imageAlts),
    itinerary,
    faqs: list(doc.faqs),
    season: normalizeSeason(doc.season),
  }
}
