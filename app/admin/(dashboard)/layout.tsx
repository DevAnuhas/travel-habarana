import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminSidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
	title: "Admin Dashboard - Travel Habarana",
	description:
		"Manage and oversee operations within the Travel Habarana administration dashboard.",
	robots: "noindex, nofollow",
};

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== "admin") {
		redirect("/admin/login");
	}

	return (
		<SidebarProvider>
			<div className="hidden md:block">
				<AdminSidebar />
			</div>
			<div className="flex-1 flex flex-col overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</div>
		</SidebarProvider>
	);
}
