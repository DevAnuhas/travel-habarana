import type { Metadata } from "next"
import { Suspense } from "react"
import BookingForm from "@/components/common/booking-form"
import { ContactActions } from "@/components/common/contact-actions"
import FAQSection from "@/components/common/faq-section"
import { MobileContactBar } from "@/components/common/mobile-contact-bar"
import { resolveInitialPackageId } from "@/lib/booking-prefill"
import { siteConfig } from "@/config/site"
import { getPackages } from "@/lib/packages"

export const metadata: Metadata = {
  title: "Book a Habarana or Minneriya Safari",
  description: `Send a no-obligation inquiry to ${siteConfig.name} for current safari pricing and availability in Habarana, Minneriya, Kaudulla, and Hurulu.`,
  alternates: { canonical: "/book-now" },
  openGraph: {
    title: `Book a Safari with ${siteConfig.name}`,
    description:
      "Request current pricing and availability for a jeep safari or village experience.",
    url: "/book-now",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Ceylon Safari wildlife and village experiences in Habarana",
      },
    ],
  },
}

type SearchParams = Promise<{ packageId?: string | string[] }>
type PackageOption = { _id: string; name: string }

export default async function BookNowPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Cached, so this stays in the static shell. searchParams is request data
  // and is only read inside <Suspense> below (Cache Components rule).
  const packages = (await getPackages()).map(({ _id, name }) => ({
    _id,
    name,
  }))

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-white md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold md:text-4xl lg:text-5xl">
            Book Your Safari Adventure
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl">
            Fill out the form below to send an inquiry. Our team will get back
            to you with pricing and availability within 24 hours.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 grid gap-3 rounded-lg border bg-card p-6">
              <h2 className="text-2xl">Fastest: message us on WhatsApp</h2>
              <p className="text-muted-foreground">
                We reply within 24 hours with availability and the current
                price.
              </p>
              <ContactActions />
            </div>
            {/* The fallback is the complete form without prefill, so the
                static HTML is a working form, never a loading message. */}
            <Suspense fallback={<BookingForm packages={packages} />}>
              <PrefilledBookingForm
                packages={packages}
                searchParams={searchParams}
              />
            </Suspense>
          </div>
        </div>
      </section>

      <FAQSection variant="booking" />
      <MobileContactBar />
    </main>
  )
}

async function PrefilledBookingForm({
  packages,
  searchParams,
}: {
  packages: PackageOption[]
  searchParams: SearchParams
}) {
  const { packageId } = await searchParams
  return (
    <BookingForm
      packages={packages}
      initialPackageId={resolveInitialPackageId(packageId, packages)}
    />
  )
}
