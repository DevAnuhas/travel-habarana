import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllPosts } from "@/sanity/queries";
import connectMongoDB from "@/lib/mongodb";
import PackageModel from "@/models/Package";

export const revalidate = 86400; // Cache for 1 day

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = (
		process.env.NEXT_PUBLIC_BASE_URL ||
		siteConfig.url ||
		""
	).replace(/\/$/, "");

	const staticPaths = ["/", "/book-now", "/contact", "/packages", "/blogs"];

	const packagePaths: string[] = [];
	let packages: Array<{ _id: string; slug?: string; updatedAt: string }> = [];

	try {
		await connectMongoDB();
		const dbPackages = await PackageModel.find(
			{},
			"slug updatedAt createdAt"
		).lean();

		// Convert to the expected format
		if (dbPackages && dbPackages.length > 0) {
			packages = dbPackages.map((pkg) => ({
				_id: String(pkg._id),
				slug: pkg.slug,
				updatedAt: pkg.updatedAt
					? new Date(pkg.updatedAt).toISOString()
					: pkg.createdAt
						? new Date(pkg.createdAt).toISOString()
						: new Date().toISOString(),
			}));
		}

		// Fall back to API if direct DB connection fails
		if (!packages || packages.length === 0) {
			const packageApiUrl = `${baseUrl}/api/packages`;

			const res = await fetch(packageApiUrl, {
				next: { revalidate: 3600 }, // Revalidate every hour
			});

			if (!res.ok) {
				console.error(
					`Failed to fetch packages for sitemap: ${res.status} ${res.statusText}`
				);
			} else {
				packages = await res.json();
			}
		}

		if (packages && packages.length > 0) {
			packages.forEach((pkg) => {
				// Prioritize slug over ID and only include if it actually exists
				if (pkg.slug) {
					packagePaths.push(`/packages/${pkg.slug}`);
				} else if (pkg._id) {
					packagePaths.push(`/packages/${pkg._id}`);
				}
			});
		}
	} catch (error) {
		console.error("Error generating package paths for sitemap:", error);
	}

	const blogPaths: string[] = [];
	let blogs: Array<{ slug: string; _updatedAt: string }> = [];

	try {
		blogs = await getAllPosts(0, 99999);

		if (blogs && blogs.length > 0) {
			blogs.forEach((blog) => {
				if (blog.slug) {
					blogPaths.push(`/blogs/${blog.slug}`);
				}
			});
		}
	} catch (error) {
		console.error("Error fetching blogs for sitemap:", error);
	}

	const packageUpdatedAt = new Map();
	if (packages && packages.length > 0) {
		packages.forEach((pkg) => {
			if (pkg && pkg._id) {
				const packageIdentifier = pkg.slug || pkg._id;
				packageUpdatedAt.set(
					`/packages/${packageIdentifier}`,
					pkg.updatedAt || new Date().toISOString()
				);
			}
		});
	}

	const blogsUpdatedAt = new Map();
	if (blogs && blogs.length > 0) {
		blogs.forEach((blog) => {
			if (blog && blog.slug) {
				blogsUpdatedAt.set(
					`/blogs/${blog.slug}`,
					blog._updatedAt || new Date().toISOString()
				);
			}
		});
	}

	const allPaths = [...staticPaths, ...packagePaths, ...blogPaths];

	// If we don't have any paths at all, at least return the homepage
	if (allPaths.length === 0) {
		return [
			{
				url: baseUrl,
				lastModified: new Date().toISOString(),
			},
		];
	}

	const getLastModified = (path: string) => {
		if (packageUpdatedAt.has(path)) {
			return packageUpdatedAt.get(path);
		}
		if (blogsUpdatedAt.has(path)) {
			return blogsUpdatedAt.get(path);
		}
		return new Date().toISOString();
	};

	const sitemap = allPaths.map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: getLastModified(path),
	}));

	return sitemap;
}
