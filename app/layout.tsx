import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
	variable: "--font-dm-serif-display",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Travel Habarana - Sri Lankan Safari & Cultural Tours",
	description:
		"Experience the best safari tours in Sri Lanka with Travel Habarana. Book jeep safaris to Hurulu, Minneriya, and Kaudulla National Parks, plus authentic village cultural tours.",
	openGraph: {
		title: "Travel Habarana - Sri Lankan Safari & Cultural Tours",
		description:
			"Experience the best safari tours in Sri Lanka with Travel Habarana. Book jeep safaris to Hurulu, Minneriya, and Kaudulla National Parks, plus authentic village cultural tours.",
		url: `https://travelhabarana.com/`,
		siteName: "Travel Habarana",
		images: [
			{
				url: "https://travelhabarana.com/assets/placeholder.jpg",
				width: 800,
				height: 600,
				alt: `Placeholder Image`,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Travel Habarana - Sri Lankan Safari & Cultural Tours",
		description:
			"Experience the best safari tours in Sri Lanka with Travel Habarana. Book jeep safaris to Hurulu, Minneriya, and Kaudulla National Parks, plus authentic village cultural tours.",
		images: [
			{
				url: "https://travelhabarana.com/assets/placeholder.jpg",
				alt: `Placeholder Image`,
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${dmSerifDisplay.variable}`}>
				<AuthProvider>
					{children}
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	);
}
