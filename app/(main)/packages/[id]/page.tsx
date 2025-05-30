import { Metadata } from "next";
import { PackageDetails } from "./package-details";
import { siteConfig } from "@/config/site";
import mongoose from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import PackageModel from "@/models/Package";

interface PackageDetailsPageProps {
	params: Promise<{ id: string }>;
}

// Interface to represent package data from database
interface Package {
	_id: mongoose.Types.ObjectId | string;
	slug: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
	__v?: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export async function generateStaticParams() {
	try {
		// Connect directly to MongoDB instead of using the API route during build
		await connectMongoDB();
		const packages = (await PackageModel.find({}).lean()) as Package[];

		return packages.map((pkg) => {
			// Use slug as primary identifier, or convert _id to string safely
			const id =
				pkg.slug ||
				(typeof pkg._id === "object" &&
				pkg._id !== null &&
				"toString" in pkg._id
					? pkg._id.toString()
					: String(pkg._id));

			return { id };
		});
	} catch (error) {
		console.error("Error generating static params:", error);
		return [];
	}
}

export async function generateMetadata({
	params,
}: PackageDetailsPageProps): Promise<Metadata> {
	const { id } = await params;

	try {
		// Connect directly to MongoDB during build instead of using the API route
		await connectMongoDB();

		// Try to find by slug first (primary lookup method)
		let packageData = (await PackageModel.findOne({
			slug: id,
		}).lean()) as Package | null;

		// Fall back to MongoDB _id only if necessary and if it's a valid ObjectId
		if (!packageData && id.match(/^[0-9a-fA-F]{24}$/)) {
			const mongoose = (await import("mongoose")).default;
			if (mongoose.Types.ObjectId.isValid(id)) {
				packageData = (await PackageModel.findById(
					id
				).lean()) as Package | null;
			}
		}

		if (!packageData) {
			return {
				title: "Package Not Found",
				description: "The requested package could not be found.",
				robots: { index: false, follow: false },
			};
		}

		return {
			title: `${packageData.name}`,
			description: packageData.description.substring(0, 160), // Limit to 160 characters for SEO
			robots: { index: true, follow: true },
			openGraph: {
				title: `${packageData.name}`,
				description: packageData.description.substring(0, 160),
				url: `${siteConfig.url}/packages/${packageData.slug || id}`,
				siteName: siteConfig.name,
				images: [
					{
						url: packageData.images?.[0] || siteConfig.ogImage,
						width: 800,
						height: 600,
						alt: `${packageData.name} Image`,
					},
				],
				locale: "en_US",
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title: `${packageData.name}`,
				description: packageData.description.substring(0, 160),
				images: [packageData.images?.[0] || siteConfig.ogImage],
			},
		};
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "Travel Package",
			description: `Discover amazing travel packages with ${siteConfig.name}.`,
			robots: { index: true, follow: true },
		};
	}
}

export default async function PackageDetailsPage({
	params,
}: PackageDetailsPageProps) {
	const { id } = await params;

	return (
		<main className="pt-20 bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<PackageDetails id={id} />
			</div>
		</main>
	);
}
