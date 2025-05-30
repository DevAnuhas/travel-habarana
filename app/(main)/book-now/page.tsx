import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/common/booking-form";
import FAQSection from "@/components/common/faq-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Book Now",
	description: `Send an inquiry to book your safari or village tour with ${siteConfig.name}`,
};

export default function BookNowPage() {
	return (
		<main className="pt-20">
			{/* Hero Section */}
			<section className="bg-primary text-white py-16 md:py-24">
				<div className="container mx-auto px-4 text-center">
					<h1 className="md:text-4xl lg:text-5xl font-bold mb-4">
						Book Your Safari Adventure
					</h1>
					<p className="text-lg md:text-xl max-w-2xl mx-auto">
						Fill out the form below to send an inquiry. Our team will get back
						to you with pricing and availability within 24 hours.
					</p>
				</div>
			</section>

			{/* Booking Form Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="max-w-2xl mx-auto">
						<Suspense
							fallback={
								<div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex justify-center items-center min-h-[400px]">
									<span className="ml-2 text-primary">Loading form...</span>
								</div>
							}
						>
							<BookingForm />
						</Suspense>
					</div>
				</div>
			</section>

			<FAQSection />
		</main>
	);
}
