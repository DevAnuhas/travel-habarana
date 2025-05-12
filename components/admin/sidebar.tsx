"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
	LayoutDashboard,
	MapPinned,
	MessageSquare,
	Users,
	LockKeyhole,
	LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
	const pathname = usePathname();

	const navItems = [
		{
			name: "Dashboard",
			href: "/admin/dashboard",
			icon: LayoutDashboard,
		},
		{
			name: "Packages",
			href: "/admin/packages",
			icon: MapPinned,
		},
		{
			name: "Inquiries",
			href: "/admin/inquiries",
			icon: MessageSquare,
		},
		{
			name: "Users",
			href: "/admin/users",
			icon: Users,
		},
		{
			name: "Change Password",
			href: "/admin/change-password",
			icon: LockKeyhole,
		},
	];

	return (
		<div className="flex flex-col h-full border-r bg-sidebar">
			<div className="p-4 border-b">
				<h1 className="text-xl font-bold text-sidebar-foreground">
					Travel Habarana
				</h1>
				<p className="text-sm text-sidebar-foreground/70">Admin Panel</p>
			</div>
			<div className="flex-1 py-4">
				<nav className="space-y-1 px-2">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center px-3 py-2 text-sm font-medium rounded-md",
								pathname === item.href
									? "bg-sidebar-primary text-sidebar-primary-foreground"
									: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
							)}
						>
							<item.icon className="mr-3 h-5 w-5" />
							{item.name}
						</Link>
					))}
				</nav>
			</div>
			<div className="p-4 border-t">
				<Button
					variant="outline"
					className="w-full justify-start"
					onClick={() => signOut({ callbackUrl: "/admin/login" })}
				>
					<LogOut className="mr-3 h-5 w-5" />
					Sign Out
				</Button>
			</div>
		</div>
	);
}
