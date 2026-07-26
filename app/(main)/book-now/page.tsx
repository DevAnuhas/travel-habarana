import type { Metadata } from "next"
import { Suspense } from "react"
import BookingForm from "@/components/common/booking-form"
import FAQSection from "@/components/common/faq-section"
import { siteConfig } from "@/config/site"
import { getPackages } from "@/lib/packages"

export const metadata: Metadata = {
  title: "Book a Habarana or Minneriya Safari",
  description: `Send a no-obligation inquiry to ${siteConfig.name} for current safari pricing and availability in Habarana, Minneriya, Kaudulla, and Hurulu.`,
  alternates: { canonical: "/book-now" },
  openGraph: {
    title: `Book a Safari with ${siteConfig.name}`,
    description:
      "Request current pricing and availability for a private jeep safari or village experience.",
    url: "/book-now",
  },
}

export default async function BookNowPage() {
  const packages = await getPackages()

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
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white p-6 shadow-lg md:p-8">
                  <span className="ml-2 text-primary">Loading form...</span>
                </div>
              }
            >
              <BookingForm
                packages={packages.map(({ _id, name }) => ({ _id, name }))}
              />
            </Suspense>
          </div>
        </div>
      </section>

      <FAQSection />
    </main>
  )
}
