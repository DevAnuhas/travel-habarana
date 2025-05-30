import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Contact Us",
	description: `Get in touch with ${siteConfig.name} for safari and village tour inquiries`,
};

export default function ContactPageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
