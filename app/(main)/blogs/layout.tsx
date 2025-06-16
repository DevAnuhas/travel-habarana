import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Blogs",
	description:
		"Discover insightful travel tips, guides, and stories about Habarana. Explore our latest blog posts to plan your perfect adventure in Sri Lanka with Travel Habarana.",
};

export default function BlogsPageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
