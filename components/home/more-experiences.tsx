import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

import PackageCard from "@/components/ui/package-card"
import { groupPackagesByCategory } from "@/lib/package-catalog"
import type { PublicPackage } from "@/lib/package-serialize"

export function MoreExperiences({ packages }: { packages: PublicPackage[] }) {
  const others = groupPackagesByCategory(packages)
    .filter((group) => group.key !== "safari")
    .flatMap((group) => group.items)
    .slice(0, 6)
  if (!others.length) return null

  return (
    <section className="bg-surface-sunken px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2>More than safaris</h2>
          <Link
            href="/packages"
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
          >
            See all packages{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}
