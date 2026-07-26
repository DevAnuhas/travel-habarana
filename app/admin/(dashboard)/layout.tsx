import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminSidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth-options";
import { AuthProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
	title: "Admin Dashboard - Travel Habarana",
	description:
		"Manage and oversee operations within the Travel Habarana administration dashboard.",
	robots: "noindex, nofollow",
};

async function AuthenticatedAdmin({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== "admin") {
		redirect("/admin/login");
	}

	return (
		<AuthProvider session={session}>
			<SidebarProvider>
				<div className="hidden md:block">
					<AdminSidebar />
				</div>
				<div className="flex flex-1 flex-col overflow-hidden">
					<main className="flex-1 overflow-y-auto p-4 md:p-6">
						{children}
					</main>
				</div>
			</SidebarProvider>
		</AuthProvider>
	);
}

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-1 items-center justify-center">
					<p className="text-sm text-muted-foreground">
						Loading administration…
					</p>
				</div>
			}
		>
			<AuthenticatedAdmin>{children}</AuthenticatedAdmin>
		</Suspense>
	);
}
