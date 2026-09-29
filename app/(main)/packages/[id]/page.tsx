import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

import { FinalCta } from "@/components/common/final-cta"
import { MobileContactBar } from "@/components/common/mobile-contact-bar"
import { BookingPanel } from "@/components/packages/booking-panel"
import {
  AboutExperience,
  Highlights,
  IncludedList,
  Itinerary,
  PackageFaqs,
  PackageHeader,
  PickupAndTimes,
  WhatToBring,
  WhenToGo,
} from "@/components/packages/landing-sections"
import { PackageGallery } from "@/components/packages/package-gallery"
import { JsonLd } from "@/components/seo/json-ld"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import PackageCard from "@/components/ui/package-card"
import { siteConfig } from "@/config/site"
import { selectRelatedPackages } from "@/lib/package-catalog"
import { resolvePackageMeta } from "@/lib/package-meta"
import { getPackage, getPackages } from "@/lib/packages"
import { buildOffer } from "@/lib/pricing"

interface PackageDetailsPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  try {
    const packages = await getPackages()
    return packages.map((packageItem) => ({ id: packageItem.slug }))
  } catch (error) {
    console.error("Unable to pre-render package routes:", error)
    return []
  }
}

export async function generateMetadata({
  params,
}: PackageDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const packageData = await getPackage(id)

  if (!packageData) {
    return {
      title: "Package Not Found",
      description: "The requested package could not be found.",
      robots: { index: false, follow: false },
    }
  }

  const { title, description } = resolvePackageMeta(packageData)
  const canonical = `/packages/${packageData.slug}`
  const image = packageData.images[0] || siteConfig.ogImage

  return {
    // `absolute`: the packages layout sets a plain title string, which resets
    // the root "%s | Ceylon Safari" template for everything below it.
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          alt:
            packageData.imageAlts?.[packageData.images[0]] ?? packageData.name,
        },
      ],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function PackageDetailsPage({
  params,
}: PackageDetailsPageProps) {
  const { id } = await params
  const [packageData, packages] = await Promise.all([
    getPackage(id),
    getPackages(),
  ])

  if (!packageData) {
    notFound()
  }

  if (id !== packageData.slug) {
    permanentRedirect(`/packages/${packageData.slug}`)
  }

  const relatedPackages = selectRelatedPackages(packageData, packages)
  const canonicalUrl = new URL(
    `/packages/${packageData.slug}`,
    siteConfig.url
  ).toString()
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: packageData.name,
      description: packageData.description,
      url: canonicalUrl,
      image: packageData.images,
      serviceType: packageData.name,
      provider: { "@id": `${siteConfig.url}/#business` },
      offers: buildOffer(packageData, canonicalUrl),
      areaServed: siteConfig.serviceAreas.map((name) => ({
        "@type": "Place",
        name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Safari packages",
          item: new URL("/packages", siteConfig.url).toString(),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: packageData.name,
          item: canonicalUrl,
        },
      ],
    },
  ]

  const isSafari = packageData.category === "safari"

  return (
    <main className="bg-background pt-20">
      <JsonLd data={structuredData} />
      <div className="container mx-auto grid gap-6 px-4 py-4 md:py-6">
        <div className="hidden md:block">
          <Breadcrumbs name={packageData.name} />
        </div>
        <PackageGallery
          images={packageData.images}
          name={packageData.name}
          alts={packageData.imageAlts}
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-10">
            <PackageHeader pkg={packageData} />
            <Highlights items={packageData.highlights} />
            <WhenToGo season={packageData.season} />
            <Itinerary steps={packageData.itinerary} />
            <IncludedList
              included={packageData.included}
              notIncluded={packageData.notIncluded}
            />
            <PickupAndTimes
              pickupAreas={packageData.pickupAreas}
              timeSlots={packageData.timeSlots}
            />
            <WhatToBring items={packageData.whatToBring} />
            <AboutExperience description={packageData.description} />
            <PackageFaqs faqs={packageData.faqs} />
            <div className="md:hidden">
              <Breadcrumbs name={packageData.name} />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel pkg={packageData} />
            </div>
          </div>
        </div>
      </div>
      {relatedPackages.length > 0 && (
        <section className="mt-16 bg-surface-sunken px-4 py-14">
          <div className="container mx-auto grid gap-8">
            <h2>
              {isSafari ? "Other safaris from Habarana" : "You might also like"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((related) => (
                <PackageCard key={related._id} pkg={related} />
              ))}
            </div>
          </div>
        </section>
      )}
      <FinalCta
        title={isSafari ? "Ready to book your safari?" : undefined}
        packageName={packageData.name}
      />
      <MobileContactBar packageName={packageData.name} price={packageData} />
    </main>
  )
}

function Breadcrumbs({ name }: { name: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/packages">Packages</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
