import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || siteConfig.url;

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api", "/admin", "/thank-you", "/review", "/privacy"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
