import { siteConfig } from "@/config/site"
import type { PublicPackage } from "@/lib/package-serialize"
import { buildPackageTitle, truncateAtWord } from "@/lib/seo"

export function resolvePackageMeta(pkg: PublicPackage): {
  title: string
  description: string
} {
  const title = pkg.seoTitle
    ? pkg.seoTitle.includes(siteConfig.name)
      ? pkg.seoTitle
      : buildPackageTitle(pkg.seoTitle)
    : buildPackageTitle(pkg.name)
  const description =
    pkg.seoDescription ?? truncateAtWord(pkg.summary ?? pkg.description)
  return { title, description }
}
