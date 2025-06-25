import HeroSection from "@/components/home/hero-section";
import PackagesSection from "@/components/home/packages-section";
import PlanVisitSection from "@/components/home/plan-visit-section";
import FeaturesSection from "@/components/home/features-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import FeaturedBlogsSection from "@/components/home/featured-blogs-section";
import CTABannerSection from "@/components/home/cta-banner-section";
import FAQSection from "@/components/common/faq-section";

// Add dynamic settings to ensure content is fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
			<FAQSection />
		</>
	);
}
