"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/spinner";
import { MapPinArea, ChatText } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
	totalPackages: number;
	totalInquiries: number;
	recentInquiries: {
		_id: string;
		name: string;
		email: string;
		phone: string;
		date: string;
		numberOfPeople: number;
	}[];
}

export default function DashboardPage() {
	const { data: session } = useSession();
	const [stats, setStats] = useState<DashboardStats>({
		totalPackages: 0,
		totalInquiries: 0,
		recentInquiries: [],
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// Fetch packages count
				const packagesRes = await fetch("/api/packages");
				const packages = await packagesRes.json();

				// Fetch recent inquiries
				const inquiriesRes = await fetch("/api/inquiries");
				const inquiries = await inquiriesRes.json();

				setStats({
					totalPackages: packages.length,
					totalInquiries: inquiries.length,
					recentInquiries: inquiries.slice(0, 5),
				});
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to load dashboard data"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-full">
					<LoadingSpinner />
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session?.user?.email || "Admin"}
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card className="gap-4">
						<CardHeader className="flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-sm font-medium">
								Total Packages
							</CardTitle>
							<MapPinArea className="h-6 w-6 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">{stats.totalPackages}</div>
							<p className="text-xs text-muted-foreground">
								Safari and village tour packages
							</p>
							<Button asChild variant="outline" size="sm" className="mt-4">
								<Link href="/admin/packages">Manage Packages</Link>
							</Button>
						</CardContent>
					</Card>

					<Card className="gap-4">
						<CardHeader className="flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-sm font-medium">
								Total Inquiries
							</CardTitle>
							<ChatText className="h-6 w-6 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">{stats.totalInquiries}</div>
							<p className="text-xs text-muted-foreground">
								Booking inquiries from customers
							</p>
							<Button asChild variant="outline" size="sm" className="mt-4">
								<Link href="/admin/inquiries">View All Inquiries</Link>
							</Button>
						</CardContent>
					</Card>
				</div>

				<div>
					<h2 className="text-xl font-semibold mb-4">Recent Inquiries</h2>
					{stats.recentInquiries.length > 0 ? (
						<div className="space-y-4">
							{stats.recentInquiries.map((inquiry) => (
								<Card key={inquiry._id}>
									<CardContent className="p-4">
										<div className="grid gap-1">
											<div className="font-medium">{inquiry.name}</div>
											<div className="text-sm text-muted-foreground">
												{inquiry.email} • {inquiry.phone}
											</div>
											<div className="text-sm">
												Date: {new Date(inquiry.date).toLocaleDateString()} •
												People: {inquiry.numberOfPeople}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
							<Button asChild variant="outline" className="w-full">
								<Link href="/admin/inquiries">View All Inquiries</Link>
							</Button>
						</div>
					) : (
						<p className="text-muted-foreground">No recent inquiries</p>
					)}
				</div>
			</div>
		</AdminLayout>
	);
}
