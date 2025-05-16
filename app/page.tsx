"use client";

import HeroSection from "@/components/home/sections/hero-section";
import PackagesSection from "@/components/home/sections/packages-section";
import PlanVisitSection from "@/components/home/sections/plan-visit-section";
import FeaturesSection from "@/components/home/sections/features-section";
import TestimonialsSection from "@/components/home/sections/testimonials-section";
import CTABannerSection from "@/components/home/sections/cta-banner-section";

export default function Home() {
	return (
		<>
			<HeroSection />
			<PackagesSection />
			<PlanVisitSection />
			<FeaturesSection />
			<TestimonialsSection />
			<CTABannerSection />
		</>
	);
}
