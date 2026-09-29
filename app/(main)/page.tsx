import type { Metadata } from "next"

import FAQSection from "@/components/common/faq-section"
import { FinalCta } from "@/components/common/final-cta"
import { MobileContactBar } from "@/components/common/mobile-contact-bar"
import FeaturedBlogsSection from "@/components/home/featured-blogs-section"
import HeroSection from "@/components/home/hero-section"
import { HowBookingWorks } from "@/components/home/how-booking-works"
import { MoreExperiences } from "@/components/home/more-experiences"
import { ParkChooser } from "@/components/home/park-chooser"
import { RealGuests } from "@/components/home/real-guests"
import { groupPackagesByCategory } from "@/lib/package-catalog"
import { getPackages } from "@/lib/packages"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Minneriya & Habarana Jeep Safaris",
  description:
    "Jeep safaris from Habarana to Minneriya, Kaudulla and Hurulu Eco Park, plus village tours and Sri Lankan cooking experiences.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Minneriya & Habarana Jeep Safaris | Ceylon Safari",
    description: siteConfig.description,
    url: "/",
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

export default async function Home() {
  const packages = await getPackages()
  const safaris =
    groupPackagesByCategory(packages).find((group) => group.key === "safari")
      ?.items ?? []

  return (
    <main>
      <HeroSection safaris={safaris} />
      <ParkChooser safaris={safaris} />
      <RealGuests />
      <HowBookingWorks />
      <MoreExperiences packages={packages} />
      <FAQSection variant="safari" />
      <FeaturedBlogsSection />
      <FinalCta />
      <MobileContactBar />
    </main>
  )
}
