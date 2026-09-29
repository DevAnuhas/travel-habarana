import { generateSlug } from "@/utils/slug"

export interface SlugState {
  slug: string
  previousSlugs: readonly string[]
}

/** Any package that answers to URLs: its current slug and its history. */
export interface SlugOwner {
  slug?: string | null
  previousSlugs?: readonly string[] | null
}

const FALLBACK_SLUG = "package"
const PACKAGE_PATH = "/packages/"

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** The un-numbered slug for a package name. */
export function packageSlugBase(name: string): string {
  return generateSlug(name) || FALLBACK_SLUG
}

/** The slug and its numbered variants (slug-2, slug-3, …). */
export function slugVariantPattern(slug: string): RegExp {
  return new RegExp(`^${escapeRegExp(slug)}(?:-\\d+)?$`)
}

/**
 * A slug for `name` that nothing else answers to: not another package's current
 * or previous slug (renamed packages keep their old URLs), and not a
 * /packages/ path that a site redirect sends elsewhere (redirects run before
 * routes, so that package could never be reached). Collisions get the first
 * free number: slug-2, slug-3, …
 */
export function chooseAvailableSlug(
  name: string,
  others: readonly SlugOwner[],
  redirects: readonly { source: string }[]
): string {
  const base = packageSlugBase(name)
  const taken = new Set<string>()
  for (const other of others) {
    if (other.slug) taken.add(other.slug)
    for (const previous of other.previousSlugs ?? []) taken.add(previous)
  }
  for (const { source } of redirects) {
    if (source.startsWith(PACKAGE_PATH)) {
      taken.add(source.slice(PACKAGE_PATH.length))
    }
  }

  if (!taken.has(base)) return base
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`
    if (!taken.has(candidate)) return candidate
  }
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
