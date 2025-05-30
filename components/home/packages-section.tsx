"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/ui/spinner";
import SectionHeading from "@/components/ui/section-heading";
import PackageCard from "@/components/ui/package-card";

interface Package {
	_id: string;
	slug: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images?: string[];
}

function PackagesSection() {
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch packages from API
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
		<section id="packages" className="py-20 px-4 bg-gray-50">
			<div className="container mx-auto">
				<SectionHeading
					title="Explore Our Safari & Village Tours"
					subtitle="Discover the beauty of Sri Lanka's wildlife and culture with our tour packages"
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{packages.map((pkg) => (
							<PackageCard
								key={pkg._id}
								id={pkg._id}
								slug={pkg.slug}
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
	);
}

export default PackagesSection;
