import FAQSection from "@/components/common/faq-section"
import { MobileContactBar } from "@/components/common/mobile-contact-bar"
import { TrustLine } from "@/components/common/trust-line"
import { JsonLd } from "@/components/seo/json-ld"
import PackageCard from "@/components/ui/package-card"
import { siteConfig } from "@/config/site"
import { groupPackagesByCategory } from "@/lib/package-catalog"
import { getPackages } from "@/lib/packages"
import { cn } from "@/lib/utils"

export default async function PackagesPage() {
  const packages = await getPackages()
  const groups = groupPackagesByCategory(packages)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ceylon Safari packages",
    itemListElement: groups
      .flatMap((group) => group.items)
      .map((packageItem, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: packageItem.name,
        url: new URL(
          `/packages/${packageItem.slug}`,
          siteConfig.url
        ).toString(),
      })),
  }

  return (
    <main>
      <JsonLd data={itemListSchema} />
      <section className="bg-primary px-4 pt-28 pb-12 text-primary-foreground">
        <div className="container mx-auto grid max-w-3xl gap-4">
          <h1>Habarana Safari &amp; Village Tour Packages</h1>
          <p className="text-lg text-primary-foreground/90">
            Message us your dates and we&apos;ll reply within 24 hours with
            availability and the current price.
          </p>
          <TrustLine tone="light" />
        </div>
      </section>

      {groups.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground">
          No packages available at the moment.
        </p>
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.key}
            aria-labelledby={`group-${group.key}`}
            className={cn(
              "px-4 py-14",
              groupIndex % 2 === 1 && "bg-surface-sunken"
            )}
          >
            <div className="container mx-auto grid gap-6">
              <div className="grid max-w-2xl gap-2">
                <h2 id={`group-${group.key}`}>{group.title}</h2>
                <p className="text-muted-foreground">{group.intro}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((pkg, index) => (
                  <PackageCard
                    key={pkg._id}
                    pkg={pkg}
                    priority={groupIndex === 0 && index < 2}
                  />
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <FAQSection variant="safari" />
      <MobileContactBar />
    </main>
  )
}
