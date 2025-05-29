import { MetadataRoute } from "next";

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "https://travelhabarana.com";

	const staticPaths = ["/", "/book-now", "/contact", "/packages"];

	const packagePaths: string[] = [];
	let packages: Array<{ _id: string; slug?: string; updatedAt: string }> = [];

	try {
		const res = await fetch(`${baseUrl}/api/packages`, {
			next: { revalidate: 3600 }, // Cache for 1 hour
		});

		if (!res.ok) {
			console.error("Failed to fetch packages for sitemap");
			return [];
		}

		packages = await res.json();
		packages.forEach((pkg) => {
			// Use slug if available, otherwise fall back to ID
			const packageIdentifier = pkg.slug || pkg._id;
			packagePaths.push(`/packages/${packageIdentifier}`);
		});
	} catch (error) {
		console.error("Error generating sitemap:", error);
	}

	const allPaths = [...staticPaths, ...packagePaths];

	const packageUpdatedAt = new Map();
	packages.forEach((pkg) => {
		const packageIdentifier = pkg.slug || pkg._id;
		packageUpdatedAt.set(`/packages/${packageIdentifier}`, pkg.updatedAt);
	});

	return allPaths.map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: packageUpdatedAt.has(path)
			? packageUpdatedAt.get(path)
			: new Date().toISOString(),
	}));
}
