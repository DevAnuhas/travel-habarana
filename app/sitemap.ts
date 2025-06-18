import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllPosts } from "@/sanity/queries";

export const revalidate = 86400; // Cache for 1 day

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || siteConfig.url;

	const staticPaths = ["/", "/book-now", "/contact", "/packages", "/blogs"];

	const packagePaths: string[] = [];
	let packages: Array<{ _id: string; slug?: string; updatedAt: string }> = [];

	try {
		const res = await fetch(`${baseUrl}/api/packages`);

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

	const blogPaths: string[] = [];
	let blogs: Array<{ slug: string; _updatedAt: string }> = [];

	blogs = await getAllPosts(99999);

	if (!blogs || blogs.length === 0) {
		return [];
	}
	blogs.forEach((blog) => {
		blogPaths.push(`/blogs/${blog.slug}`);
	});

	const packageUpdatedAt = new Map();
	packages.forEach((pkg) => {
		const packageIdentifier = pkg.slug || pkg._id;
		packageUpdatedAt.set(`/packages/${packageIdentifier}`, pkg.updatedAt);
	});

	const blogsUpdatedAt = new Map();
	blogs.forEach((blog) => {
		blogsUpdatedAt.set(`/blogs/${blog.slug}`, blog._updatedAt);
	});

	const allPaths = [...staticPaths, ...packagePaths, ...blogPaths];

	const getLastModified = (path: string) => {
		if (packageUpdatedAt.has(path)) {
			return packageUpdatedAt.get(path);
		}
		if (blogsUpdatedAt.has(path)) {
			return blogsUpdatedAt.get(path);
		}
		return new Date().toISOString();
	};

	return allPaths.map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: getLastModified(path),
	}));
}
