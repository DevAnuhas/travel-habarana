import PackageCard from "@/components/ui/package-card"
import type { PublicPackage } from "@/lib/package-serialize"

export function ParkChooser({ safaris }: { safaris: PublicPackage[] }) {
  if (!safaris.length) return null
  return (
    <section id="safaris" className="scroll-mt-24 px-4 py-16 md:py-20">
      <div className="container mx-auto grid gap-8">
        <div className="grid max-w-2xl gap-3">
          <h2>Choose your park</h2>
          <p className="text-muted-foreground">
            Not sure which park? Send us your dates and we&apos;ll recommend
            one.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safaris.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}
