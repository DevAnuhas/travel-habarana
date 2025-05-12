"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Calendar, Package } from "lucide-react";
import LoadingSpinner from "@/components/ui/spinner";
import { toast } from "sonner";

type Inquiry = {
	_id: string;
	name: string;
	email: string;
	phone: string;
	packageId: string;
	date: string;
	numberOfPeople: number;
	specialRequests?: string;
	createdAt: string;
};

type PackageType = {
	_id: string;
	name: string;
};

export default function InquiriesPage() {
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const [packages, setPackages] = useState<PackageType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedPackage, setSelectedPackage] = useState<string>("");
	const [selectedDate, setSelectedDate] = useState<string>("");

	useEffect(() => {
		fetchPackages();
		fetchInquiries();
	}, []);

	useEffect(() => {
		fetchInquiries(selectedPackage, selectedDate);
	}, [selectedPackage, selectedDate]);

	const fetchPackages = async () => {
		try {
			const res = await fetch("/api/packages");
			const data = await res.json();
			setPackages(data);
		} catch {
			toast.error("Failed to load packages");
		}
	};

	const fetchInquiries = async (packageId?: string, date?: string) => {
		try {
			setIsLoading(true);

			let url = "/api/inquiries";
			const params = new URLSearchParams();

			if (packageId) params.append("packageId", packageId);
			if (date) params.append("date", date);

			if (params.toString()) {
				url += `?${params.toString()}`;
			}

			const res = await fetch(url);
			const data = await res.json();
			setInquiries(data);
		} catch {
			toast.error("Failed to load inquiries");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this inquiry?")) {
			return;
		}

		try {
			const res = await fetch(`/api/inquiries/${id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to delete inquiry");
			}

			toast.success("Inquiry deleted successfully");
			fetchInquiries(selectedPackage, selectedDate);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "An error occurred");
			} else {
				toast.error("An unexpected error occurred");
			}
		}
	};

	const getPackageName = (packageId: string) => {
		const pkg = packages.find((p) => p._id === packageId);
		return pkg ? pkg.name : "Unknown Package";
	};

	const resetFilters = () => {
		setSelectedPackage("");
		setSelectedDate("");
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Inquiries</h1>
					<p className="text-muted-foreground">
						Manage booking inquiries from customers
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
						<CardDescription>
							Filter inquiries by package and date
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<label className="text-sm font-medium">Package</label>
								<Select
									value={selectedPackage}
									onValueChange={setSelectedPackage}
								>
									<SelectTrigger>
										<SelectValue placeholder="All Packages" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Packages</SelectItem>
										{packages.map((pkg) => (
											<SelectItem key={pkg._id} value={pkg._id}>
												{pkg.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Date</label>
								<Input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
								/>
							</div>

							<div className="flex items-end">
								<Button variant="outline" onClick={resetFilters}>
									Reset Filters
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<LoadingSpinner />
					</div>
				) : inquiries.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center h-64">
							<p className="text-muted-foreground">No inquiries found</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{inquiries.map((inquiry) => (
							<Card key={inquiry._id}>
								<CardHeader className="pb-2">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle>{inquiry.name}</CardTitle>
											<CardDescription>
												{inquiry.email} • {inquiry.phone}
											</CardDescription>
										</div>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDelete(inquiry._id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid gap-2 text-sm">
										<div className="flex items-center">
											<Package className="mr-2 h-4 w-4 text-muted-foreground" />
											<span className="font-medium">Package:</span>
											<span className="ml-2">
												{getPackageName(inquiry.packageId)}
											</span>
										</div>
										<div className="flex items-center">
											<Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
											<span className="font-medium">Date:</span>
											<span className="ml-2">
												{new Date(inquiry.date).toLocaleDateString()}
											</span>
										</div>
										<div>
											<span className="font-medium">Number of People:</span>
											<span className="ml-2">{inquiry.numberOfPeople}</span>
										</div>
										{inquiry.specialRequests && (
											<div>
												<span className="font-medium">Special Requests:</span>
												<p className="mt-1 text-muted-foreground">
													{inquiry.specialRequests}
												</p>
											</div>
										)}
										<div className="text-xs text-muted-foreground mt-2">
											Submitted on{" "}
											{new Date(inquiry.createdAt).toLocaleString()}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
