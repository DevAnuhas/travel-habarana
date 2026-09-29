import { getPackages } from "@/lib/packages";
import PackageCard from "@/components/ui/package-card";
import SectionHeading from "@/components/ui/section-heading";

export default async function PackagesSection() {
	const packages = await getPackages();

	return (
		<section id="packages" className="bg-gray-50 px-4 py-20">
			<div className="container mx-auto">
				<SectionHeading
					title="Explore Our Safari & Village Tours"
					subtitle="Discover the beauty of Sri Lanka's wildlife and culture with our tour packages"
				/>

				{packages.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-gray-500">
							No packages available at the moment. Please check back later.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						{packages.map((packageItem) => (
							<PackageCard key={packageItem._id} pkg={packageItem} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
