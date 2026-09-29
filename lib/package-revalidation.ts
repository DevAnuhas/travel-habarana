import { revalidatePath, revalidateTag } from "next/cache"

/**
 * Refresh everything that shows package data after an admin create, edit or
 * delete. { expire: 0 } never serves the old entry: with "max" the next
 * visitor would still see a price or claim the admin just corrected.
 * (updateTag does the same but only works in Server Actions.)
 */
export function revalidatePackages(...slugs: Array<string | null | undefined>) {
  revalidateTag("package", { expire: 0 })
  revalidatePath("/packages")
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/packages/${slug}`)
  }
  revalidatePath("/sitemap.xml")
}
