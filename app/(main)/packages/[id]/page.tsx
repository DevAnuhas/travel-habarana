"use client";

import { useState, useEffect, Suspense } from "react";
import { PackageDetails } from "./package-details";
import LoadingSpinner from "@/components/ui/spinner";

// Custom CSS to hide scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

export default function PackageDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{
		id: string;
	} | null>(null);

	useEffect(() => {
		const resolveParams = async () => {
			const data = await params;
			setResolvedParams(data);
		};
		resolveParams();
	}, [params]);

	if (!resolvedParams) {
		return (
			<div className="flex justify-center items-center h-screen">
				<LoadingSpinner />
			</div>
		);
	}
	return (
		<main className="pt-20 bg-gray-50">
			<style jsx global>
				{scrollbarHideStyles}
			</style>
			<div className="container mx-auto px-4 py-8">
				<Suspense
					fallback={
						<div className="flex justify-center items-center h-screen">
							<LoadingSpinner />
						</div>
					}
				>
					<PackageDetails id={resolvedParams.id} />
				</Suspense>
			</div>
		</main>
	);
}
