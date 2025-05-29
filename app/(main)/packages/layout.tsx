import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Our Safari & Tour Packages",
	description:
		"Explore our experiences designed to showcase the best of Sri Lanka's wildlife and culture with our tour packages",
};

export default function PackagesPageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
