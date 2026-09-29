import type { Metadata } from "next"

import HeroSection from "@/components/home/hero-section"
import PackagesSection from "@/components/home/packages-section"
import PlanVisitSection from "@/components/home/plan-visit-section"
import FeaturesSection from "@/components/home/features-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import FeaturedBlogsSection from "@/components/home/featured-blogs-section"
import CTABannerSection from "@/components/home/cta-banner-section"
import FAQSection from "@/components/common/faq-section"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Minneriya & Habarana Jeep Safaris",
  description:
    "Private elephant jeep safaris from Habarana to Minneriya, Kaudulla, and Hurulu Eco Park, plus village tours and Sri Lankan cooking experiences.",
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

export default function Home() {
  return (
    <>
      <HeroSection />
      <PackagesSection />
      <PlanVisitSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FeaturedBlogsSection />
      <CTABannerSection />
      <FAQSection variant="safari" />
    </>
  )
}
