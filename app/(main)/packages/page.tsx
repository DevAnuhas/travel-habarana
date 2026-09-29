import FAQSection from "@/components/common/faq-section"
import PackageCard from "@/components/ui/package-card"
import SectionHeading from "@/components/ui/section-heading"
import { JsonLd } from "@/components/seo/json-ld"
import { siteConfig } from "@/config/site"
import { getPackages } from "@/lib/packages"

export default async function PackagesPage() {
  const packages = await getPackages()
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ceylon Safari packages",
    itemListElement: packages.map((packageItem, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: packageItem.name,
      url: new URL(`/packages/${packageItem.slug}`, siteConfig.url).toString(),
    })),
  }

  return (
    <main className="pt-20">
      <JsonLd data={itemListSchema} />
      <section className="bg-primary py-16 text-white md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Habarana Safari &amp; Village Tour Packages
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl">
            Explore our experiences designed to showcase the best of Sri Lankan
            wildlife and culture
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Available Packages"
            subtitle="Choose from our selection of safari and cultural experiences"
          />

          {packages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                No packages available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              {packages.map((packageItem) => (
                <PackageCard
                  key={packageItem._id}
                  id={packageItem._id}
                  slug={packageItem.slug}
                  name={packageItem.name}
                  description={packageItem.description}
                  duration={packageItem.duration}
                  included={packageItem.included}
                  image={packageItem.images[0]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <FAQSection variant="safari" />
    </main>
  )
}
