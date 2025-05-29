import { Metadata } from "next";
import { PackageDetails } from "./package-details";

interface PackageDetailsPageProps {
	params: Promise<{ id: string }>;
}

interface Package {
	_id: string;
	slug: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
}

// Determine the base URL based on environment
const getBaseUrl = () => {
	if (process.env.NEXT_PUBLIC_BASE_URL) {
		return process.env.NEXT_PUBLIC_BASE_URL;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	if (process.env.NODE_ENV === "production") {
		return "https://travelhabarana.com";
	}
	return "http://localhost:3000";
};

export async function generateStaticParams() {
	try {
		const res = await fetch(`${getBaseUrl()}/api/packages`, {
			next: { revalidate: 3600 }, // Cache for 1 hour
		});

		if (!res.ok) {
			console.error("Failed to fetch packages for static params");
			return [];
		}

		const packages: Package[] = await res.json();
		return packages.map((pkg) => ({
			id: pkg.slug || pkg._id, // Prefer slug, fallback to _id for backward compatibility
		}));
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
		const res = await fetch(`${getBaseUrl()}/api/packages/${id}`, {
			next: { revalidate: 3600 }, // Cache for 1 hour
		});

		if (!res.ok) {
			return {
				title: "Package Not Found",
				description: "The requested package could not be found.",
				robots: { index: false, follow: false },
			};
		}

		const packageData = await res.json();

		return {
			title: `${packageData.name}`,
			description: packageData.description.substring(0, 160), // Limit to 160 characters for SEO
			robots: { index: true, follow: true },
			openGraph: {
				title: `${packageData.name}`,
				description: packageData.description.substring(0, 160),
				url: `https://travelhabarana.com/packages/${packageData.slug || id}`,
				siteName: "Travel Habarana",
				images: [
					{
						url:
							packageData.images[0] ||
							"https://travelhabarana.com/assets/placeholder.jpg",
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
				images: [
					packageData.images[0] ||
						"https://travelhabarana.com/assets/placeholder.jpg",
				],
			},
		};
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "Travel Package",
			description: "Discover amazing travel packages with Travel Habarana.",
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
