import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
	title: "Admin Dashboard - Travel Habarana",
	description:
		"Manage and oversee operations within the Travel Habarana administration dashboard.",
	robots: "noindex, nofollow",
};

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex h-screen bg-background">
			<div className="w-64 hidden md:block">
				<Sidebar />
			</div>
			<div className="flex-1 flex flex-col overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
