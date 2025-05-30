"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
	SquaresFour,
	ChatText,
	Tag,
	Users,
	Password,
	User,
	SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
	const pathname = usePathname();

	const navItems = [
		{
			name: "Dashboard",
			href: "/admin/dashboard",
			icon: SquaresFour,
		},
		{
			name: "Inquiries",
			href: "/admin/inquiries",
			icon: ChatText,
		},
		{
			name: "Packages",
			href: "/admin/packages",
			icon: Tag,
		},
		{
			name: "Users",
			href: "/admin/users",
			icon: Users,
		},
		{
			name: "Change Password",
			href: "/admin/change-password",
			icon: Password,
		},
	];

	const { data: session } = useSession();

	return (
		<Sidebar variant="sidebar" collapsible="icon">
			<SidebarHeader className="p-4 group-data-[collapsible=icon]:px-0 border-b gap-0">
				<div className="flex justify-between items-center h-12">
					<div className="flex flex-col group-data-[collapsible=icon]:hidden">
						<h1 className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">
							<Link href="/">{siteConfig.name}</Link>
						</h1>
						<p className="text-sm text-sidebar-foreground/70">Admin Panel</p>
					</div>
					<SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu className="px-2 py-4">
					{navItems.map((item) => (
						<SidebarMenuItem key={item.href}>
							<SidebarMenuButton
								asChild
								isActive={pathname === item.href}
								tooltip={item.name}
							>
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center px-3 text-sm font-medium rounded-md whitespace-nowrap",
										pathname === item.href
											? "!bg-sidebar-primary !text-sidebar-primary-foreground"
											: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
									)}
								>
									<item.icon className="mr-2 !h-5 !w-5" />
									{item.name}
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter className="p-4 group-data-[collapsible=icon]:px-0 border-t">
				<div className="group-data-[collapsible=icon]:hidden flex items-center gap-2 rounded-md border p-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
						<User className="h-4 w-4 text-primary-foreground" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Admin User</span>
						<span className="text-xs text-muted-foreground">
							{session?.user.email}
						</span>
					</div>
				</div>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-start group-data-[collapsible=icon]:border-0"
						>
							<SignOut className="mr-3 h-5 w-5" />
							<span className="group-data-[collapsible=icon]:hidden">
								Sign Out
							</span>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className="sm:max-w-[400px]">
						<AlertDialogHeader>
							<AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to sign out?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => signOut({ callbackUrl: "/admin/login" })}
							>
								Yes, Sign Out
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
