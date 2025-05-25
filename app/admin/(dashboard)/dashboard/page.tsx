"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/spinner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tag, ChatText } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface DashboardStats {
	totalPackages: number;
	totalInquiries: number;
	totalInquiriesThisMonth: number;
	recentInquiries: {
		_id: string;
		name: string;
		packageId: {
			name: string;
		};
		date: string;
		numberOfPeople: number;
	}[];
	popularPackages: {
		_id: string;
		name: string;
		duration: string;
		images: string[];
	}[];
}

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalPackages: 0,
		totalInquiries: 0,
		totalInquiriesThisMonth: 0,
		recentInquiries: [],
		popularPackages: [],
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
				const data = await inquiriesRes.json();
				const inquiries = data.inquiries;

				setStats({
					totalPackages: packages.length,
					totalInquiries: inquiries.length,
					totalInquiriesThisMonth: inquiries.length,
					recentInquiries: inquiries.slice(0, 5),
					popularPackages: packages.slice(0, 4),
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
			<div className="flex items-center justify-center h-full">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex gap-2">
				<SidebarTrigger className="md:hidden" />
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome to the Travel Habarana admin dashboard.
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="gap-0">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-lg font-medium">
							Total Packages
						</CardTitle>
						<Tag className="h-6 w-6 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">
							Safari and village tour packages
						</p>
						<div className="text-3xl font-bold pt-4">{stats.totalPackages}</div>
					</CardContent>
				</Card>

				<Card className="gap-0">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-lg font-medium">
							Total Inquiries
						</CardTitle>
						<ChatText className="h-6 w-6 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">
							Booking inquiries from customers
						</p>
						<div className="text-3xl font-bold pt-4">
							{stats.totalInquiries}
						</div>
					</CardContent>
				</Card>

				<Card className="gap-0">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-lg font-medium">
							Inquiries This Month
						</CardTitle>
						<ChatText className="h-6 w-6 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">
							New inquiries received in this month
						</p>
						<div className="text-3xl font-bold pt-4">
							{stats.totalInquiriesThisMonth}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader className="flex items-center justify-between border-b">
						<CardTitle className="text-lg font-medium">
							Recent Inquiries
						</CardTitle>
						<Button asChild variant="link" size="sm" className="p-0">
							<Link href="/admin/inquiries">View All Inquiries</Link>
						</Button>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Name
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Package
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{stats.recentInquiries.map((inquiry) => (
										<tr key={inquiry._id}>
											<td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{inquiry.name}
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
												{inquiry.packageId?.name || "Unknown Package"}
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(inquiry.date).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex items-center justify-between border-b">
						<CardTitle className="text-lg font-medium">
							Popular Packages
						</CardTitle>
						<Button asChild variant="link" size="sm" className="p-0">
							<Link href="/admin/packages">Manage Packages</Link>
						</Button>
					</CardHeader>
					<CardContent>
						<ul className="divide-y divide-gray-200">
							{stats.popularPackages.slice(0, 4).map((pkg) => (
								<li key={pkg._id} className="py-4">
									<div className="flex items-center space-x-4">
										<div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
											<Image
												src={pkg.images[0] || "https://via.placeholder.com/40"}
												alt={pkg.name}
												width={40}
												height={40}
												className="h-full w-full object-cover"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{pkg.name}
											</p>
											<p className="text-sm text-gray-500 truncate">
												{pkg.duration}
											</p>
										</div>
										<div>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												Active
											</span>
										</div>
									</div>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
