import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

import { siteConfig } from "@/config/site"
import { JsonLd } from "@/components/seo/json-ld"
import { selectRelatedPackages } from "@/lib/package-catalog"
import { buildOffer } from "@/lib/pricing"
import { buildPackageTitle, truncateAtWord } from "@/lib/seo"
import { getPackage, getPackages } from "@/lib/packages"
import { PackageDetails } from "./package-details"

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

  const description = truncateAtWord(packageData.description)
  const title = buildPackageTitle(packageData.name)
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
      images: [{ url: image, alt: packageData.name }],
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

  return (
    <main className="bg-gray-50 pt-20">
      <JsonLd data={structuredData} />
      <div className="container mx-auto px-4 py-8">
        <PackageDetails
          packageData={packageData}
          relatedPackages={relatedPackages}
        />
      </div>
    </main>
  )
}
