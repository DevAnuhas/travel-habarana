"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/section-heading";
import PackageCard from "@/components/ui/package-card";
import LoadingSpinner from "@/components/ui/spinner";
import FAQSection from "@/components/common/faq-section";

interface Package {
	_id: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
}

export default function PackagesPage() {
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchPackages = async () => {
			try {
				const res = await fetch("/api/packages");
				const data = await res.json();
				setPackages(data);
			} catch (error) {
				console.error("Failed to fetch packages:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPackages();
	}, []);

	return (
		<main className="pt-20">
			{/* Hero Section */}
			<section className="bg-primary text-white py-16 md:py-24">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
						Our Safari & Village Tour Packages
					</h1>
					<p className="text-lg md:text-xl max-w-2xl mx-auto">
						Explore our experiences designed to showcase the best of Sri Lankan
						wildlife and culture
					</p>
				</div>
			</section>

			{/* Packages Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<SectionHeading
						title="Available Packages"
						subtitle="Choose from our selection of safari and cultural experiences"
					/>

					{isLoading ? (
						<div className="flex justify-center items-center h-64">
							<LoadingSpinner />
						</div>
					) : packages.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500">
								No packages available at the moment. Please check back later.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
							{packages.map((pkg) => (
								<PackageCard
									key={pkg._id}
									id={pkg._id}
									name={pkg.name}
									description={pkg.description}
									duration={pkg.duration}
									included={pkg.included}
									image={pkg.images?.[0]}
								/>
							))}
						</div>
					)}
				</div>
			</section>

			{/* FAQ Section */}
			<FAQSection />
		</main>
	);
}
