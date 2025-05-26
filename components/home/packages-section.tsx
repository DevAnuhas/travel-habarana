"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/ui/spinner";
import SectionHeading from "@/components/ui/section-heading";
import PackageCard from "@/components/ui/package-card";

interface Package {
	_id: string;
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
					// If API returns no packages, show fallback content
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<PackageCard
							id="hurulu"
							name="Hurulu Eco Park Safari"
							description="Explore a UNESCO biosphere with elephant sightings and diverse wildlife in their natural habitat."
							duration="Half Day (3-4 hours)"
							included={[
								"Luxury jeep with seatbelts",
								"Professional guide",
								"Water bottles",
								"Park entrance fees",
							]}
							image="/images/placeholder.svg?height=400&width=600"
						/>
						<PackageCard
							id="minneriya"
							name="Minneriya National Park Safari"
							description="Witness the famous Elephant Gathering, one of Asia's greatest wildlife spectacles."
							duration="Half Day (3-4 hours)"
							included={[
								"Luxury jeep with seatbelts",
								"Professional guide",
								"Water bottles",
								"Park entrance fees",
							]}
							image="/images/placeholder.svg?height=400&width=600"
						/>
						<PackageCard
							id="kaudulla"
							name="Kaudulla National Park Safari"
							description="Discover diverse wildlife year-round including elephants, deer, and numerous bird species."
							duration="Half Day (3-4 hours)"
							included={[
								"Luxury jeep with seatbelts",
								"Professional guide",
								"Water bottles",
								"Park entrance fees",
							]}
							image="/images/placeholder.svg?height=400&width=600"
						/>
						<PackageCard
							id="village"
							name="Cultural Village Tour"
							description="Immerse in local life with a traditional boat ride, farming experience, and authentic 9-curry lunch."
							duration="Full Day (6-7 hours)"
							included={[
								"Traditional boat ride",
								"Local guide",
								"9-curry lunch",
								"Farming experience",
							]}
							image="/images/placeholder.svg?height=400&width=600"
						/>
					</div>
				) : (
					// Display packages from API
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
	);
}

export default PackagesSection;
