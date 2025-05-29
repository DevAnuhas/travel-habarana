export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// Determine the base URL based on environment
	const getBaseUrl = () => {
		if (process.env.NEXT_PUBLIC_BASE_URL) {
			return process.env.NEXT_PUBLIC_BASE_URL;
		}
		if (process.env.VERCEL_URL) {
			return `https://${process.env.VERCEL_URL}`;
		}
		if (process.env.NODE_ENV === "production") {
			return "https://travelhabarana.com"; // Replace with your actual domain
		}
		return "http://localhost:3000";
	};

	try {
		const res = await fetch(`${getBaseUrl()}/api/packages/${id}`, {
			cache: "no-store", // Ensure fresh data for each request
		});

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
				url: `https://travelhabarana.com/packages/${id}`,
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
					packageData.images[0] ||
						"https://travelhabarana.com/assets/placeholder.jpg",
				],
			},
		};
	} catch (error) {
		console.error("Error generating metadata:", error);
		// Return fallback metadata if fetch fails
		return {
			title: "Travel Package - Travel Habarana",
			description: "Discover amazing travel packages with Travel Habarana.",
			robots: { index: true, follow: true },
		};
	}
}

export default function PackagePageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
