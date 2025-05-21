export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const res = await fetch(
		`http://localhost:3000/api/packages/${resolvedParams.id}`,
		{
			cache: "no-store", // Ensure fresh data for each request
		}
	);

	if (!res.ok) {
		return {
			title: "Package Not Found - Travel Habarana",
			description: "The requested package could not be found.",
			robots: { index: false, follow: false },
		};
	}

	const packageData = await res.json();

	return {
		title: `${packageData.name} - Travel Habarana`,
		description: packageData.description.substring(0, 160), // Limit to 160 characters for SEO
		robots: { index: true, follow: true },
		openGraph: {
			title: `${packageData.name} - Travel Habarana`,
			description: packageData.description.substring(0, 160),
			url: `https://travelhabarana.com/packages/${resolvedParams.id}`,
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
			title: `${packageData.name} - Travel Habarana`,
			description: packageData.description.substring(0, 160),
			images: [
				packageData.images[0] || "https://travelhabarana.com/placeholder.jpg",
			],
		},
	};
}

export default function PackagePageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
