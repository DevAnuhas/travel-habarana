import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

import { siteConfig } from "@/config/site"
import { JsonLd } from "@/components/seo/json-ld"
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

  const description = packageData.description.slice(0, 160)
  const canonical = `/packages/${packageData.slug}`
  const image = packageData.images[0] || siteConfig.ogImage

  return {
    title: packageData.name,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: packageData.name,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [{ url: image, alt: packageData.name }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: packageData.name,
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

  const relatedPackages = packages
    .filter((packageItem) => packageItem._id !== packageData._id)
    .slice(0, 3)
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
