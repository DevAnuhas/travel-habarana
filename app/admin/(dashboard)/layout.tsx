import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
