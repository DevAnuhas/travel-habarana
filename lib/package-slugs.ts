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
