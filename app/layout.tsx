import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { siteConfig } from "@/config/site";

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
	metadataBase: new URL(siteConfig.url),
	title: {
		default: `${siteConfig.name} - Sri Lankan Safari & Cultural Tours`,
		template: `%s | ${siteConfig.name}`,
	},
	description:
		"Experience the best safari tours in Sri Lanka with Travel Habarana. Book jeep safaris to Hurulu, Minneriya, and Kaudulla National Parks, plus authentic village cultural tours.",
	keywords: [
		"Travel Habarana",
		"Sri Lanka Safari Tours",
		"Hurulu Eco Park",
		"Minneriya National Park",
		"Kaudulla National Park",
		"Jeep Safari Sri Lanka",
		"Cultural Tours Sri Lanka",
		"Village Tours Sri Lanka",
		"Wildlife Tours Sri Lanka",
		"Travel Packages Sri Lanka",
		"Book Safari Tours Sri Lanka",
		"Travel Sri Lanka",
		"Sri Lanka Travel Guide",
	],
	openGraph: {
		title: {
			default: `${siteConfig.name} - Sri Lankan Safari & Cultural Tours`,
			template: `%s | ${siteConfig.name}`,
		},
		description: siteConfig.description,
		url: siteConfig.url,
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.ogImage,
				width: 800,
				height: 600,
				alt: `${siteConfig.name} - Featured Image`,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: {
			default: `${siteConfig.name} - Sri Lankan Safari & Cultural Tours`,
			template: `%s | ${siteConfig.name}`,
		},
		description: siteConfig.description,
		images: [
			{
				url: siteConfig.ogImage,
				alt: `${siteConfig.name} - Featured Image`,
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
