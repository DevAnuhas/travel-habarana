import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { getPackages } from "@/lib/packages"
import { getPostSlugs } from "@/sanity/queries"

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packages, posts] = await Promise.all([getPackages(), getPostSlugs()])

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/packages") },
    { url: absoluteUrl("/blogs") },
    { url: absoluteUrl("/book-now") },
    { url: absoluteUrl("/contact") },
  ]

  const packagePages: MetadataRoute.Sitemap = packages.map((packageItem) => ({
    url: absoluteUrl(`/packages/${packageItem.slug}`),
    lastModified: packageItem.updatedAt,
    images: packageItem.images,
  }))

  const blogPages: MetadataRoute.Sitemap = posts
    .filter(
      (post: { slug?: string | null }) =>
        typeof post.slug === "string" && post.slug.length > 0
    )
    .map((post: { slug: string; _updatedAt?: string }) => ({
      url: absoluteUrl(`/blogs/${post.slug}`),
      lastModified: post._updatedAt,
    }))

  return [...staticPages, ...packagePages, ...blogPages]
}
