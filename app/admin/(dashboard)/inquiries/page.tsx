"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
	CheckCircle,
	PhoneCall,
	XCircle,
	Clock,
	DotsThreeOutline,
	Tag,
	CalendarDots,
	Users,
	Copy,
} from "@phosphor-icons/react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Inquiry = {
	_id: string;
	name: string;
	email: string;
	phone: string;
	packageId: {
		_id: string;
		name: string;
	};
	date: string;
	numberOfPeople: number;
	specialRequests?: string;
	status: "new" | "contacted" | "confirmed" | "cancelled";
	createdAt: string;
};

type Package = {
	_id: string;
	name: string;
};

export default function InquiriesPage() {
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
		pageCount: 0,
		total: 0,
	});
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

	// Clean up stale selections when inquiries change
	useEffect(() => {
		const validIndices = inquiries.map((_, i) => i.toString());
		const newSelection = Object.fromEntries(
			Object.entries(rowSelection).filter(([index]) =>
				validIndices.includes(index)
			)
		);
		if (Object.keys(newSelection).length !== Object.keys(rowSelection).length) {
			setRowSelection(newSelection);
		}
	}, [inquiries, rowSelection]);

	// Update selected inquiry IDs when row selection changes
	useEffect(() => {
		const selectedIds = Object.entries(rowSelection)
			.filter(([, selected]) => selected)
			.map(([index]) => {
				const numIndex = Number(index);
				return inquiries[numIndex]?._id;
			})
			.filter(Boolean) as string[];
		setSelectedInquiryIds(selectedIds);
	}, [rowSelection, inquiries]);

	// Fetch packages on mount
	useEffect(() => {
		fetchPackages();
	}, []);

	const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);
	const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedPackageIds, setSelectedPackageIds] = useState<string[] | null>(
		null
	);
	const [selectedStatuses, setSelectedStatuses] = useState<string[] | null>(
		null
	);

	const fetchPackages = async () => {
		try {
			const res = await fetch("/api/packages");
			const data = await res.json();
			setPackages(data);
		} catch {
			toast.error("Failed to load packages");
		}
	};

	const fetchInquiries = useCallback(async () => {
		try {
			setIsLoading(true);
			const params = new URLSearchParams();
			params.append("page", String(pagination.pageIndex + 1));
			params.append("pageSize", String(pagination.pageSize));

			if (searchQuery) params.append("search", searchQuery);
			if (selectedDate)
				params.append("date", format(selectedDate, "yyyy-MM-dd"));
			if (selectedPackageIds && selectedPackageIds.length > 0) {
				selectedPackageIds.forEach((id) => params.append("packageId", id));
			}
			if (selectedStatuses && selectedStatuses.length > 0) {
				selectedStatuses.forEach((status) => params.append("status", status));
			}

			const res = await fetch(`/api/inquiries?${params.toString()}`);
			if (!res.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await res.json();

			setPagination((prev) => ({
				...prev,
				pageCount: data.pagination.pageCount,
				total: data.pagination.total,
			}));

			setInquiries(data.inquiries);
		} catch (err) {
			if (err instanceof Error && err.name !== "AbortError") {
				toast.error(`Failed to load inquiries: ${err.message}`);
			}
		} finally {
			setIsLoading(false);
		}
	}, [
		pagination.pageIndex,
		pagination.pageSize,
		searchQuery,
		selectedDate,
		selectedPackageIds,
		selectedStatuses,
	]);

	// Debounce fetch inquiries to prevent rapid re-renders
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchInquiries();
		}, 300);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [
		pagination.pageIndex,
		pagination.pageSize,
		searchQuery,
		selectedDate,
		selectedPackageIds,
		selectedStatuses,
		fetchInquiries,
	]);

	const handlePaginationChange = useCallback(
		(pageIndex: number, pageSize: number) => {
			setPagination((prev) => ({
				...prev,
				pageIndex,
				pageSize,
			}));
		},
		[]
	);

	const handleStatusUpdate = async () => {
		if (!statusToUpdate || selectedInquiryIds.length === 0) return;

		try {
			const res = await fetch("/api/inquiries/status", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					ids: selectedInquiryIds,
					status: statusToUpdate,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to update status");
			}

			toast.success(
				`Updated status to ${statusToUpdate} for ${selectedInquiryIds.length} inquiries`
			);
			setRowSelection({});
			fetchInquiries();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			toast.error(errorMessage);
		} finally {
			setStatusToUpdate(null);
			setIsStatusDialogOpen(false);
		}
	};

	const openStatusDialog = (status: string) => {
		setStatusToUpdate(status);
		setIsStatusDialogOpen(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "new":
				return <Badge className="bg-blue-500">New</Badge>;
			case "contacted":
				return <Badge className="bg-yellow-500">Contacted</Badge>;
			case "confirmed":
				return <Badge className="bg-green-500">Confirmed</Badge>;
			case "cancelled":
				return <Badge className="bg-red-500">Cancelled</Badge>;
			default:
				return <Badge>Unknown</Badge>;
		}
	};

	const handlePackageFilterChange = (packageIds: string[] | undefined) => {
		setSelectedPackageIds(packageIds || null);
	};

	const handleStatusFilterChange = (statuses: string[] | undefined) => {
		setSelectedStatuses(statuses || null);
	};

	const handleDateFilterChange = useCallback(
		(dateStr: string | undefined) => {
			// Don't update state if the date hasn't actually changed
			const newDate = dateStr ? new Date(dateStr) : null;
			const currentDateStr = selectedDate
				? format(selectedDate, "yyyy-MM-dd")
				: null;

			if (dateStr !== currentDateStr) {
				setSelectedDate(newDate);
			}
		},
		[selectedDate]
	);

	// Define columns for the data table
	const columns = useMemo<ColumnDef<Inquiry>[]>(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<input
						type="checkbox"
						checked={table.getIsAllPageRowsSelected()}
						onChange={table.getToggleAllPageRowsSelectedHandler()}
						ref={(el) => {
							if (el) {
								el.indeterminate = table.getIsSomePageRowsSelected();
							}
						}}
						className="h-4 w-4 rounded border-gray-300"
					/>
				),
				cell: ({ row }) => (
					<input
						type="checkbox"
						checked={row.getIsSelected()}
						onChange={row.getToggleSelectedHandler()}
						className="h-4 w-4 rounded border-gray-300"
					/>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				accessorKey: "name",
				header: "Customer",
				cell: ({ row }) => {
					const inquiry = row.original;
					return (
						<div className="flex flex-col">
							<span className="font-medium">{inquiry.name}</span>
							<span className="text-xs text-muted-foreground">
								{inquiry.email}
							</span>
							<span className="text-xs text-muted-foreground">
								{inquiry.phone}
							</span>
						</div>
					);
				},
				// Custom filter function for client-side search (though primarily handled server-side)
				filterFn: (row, id, value) => {
					const inquiry = row.original;
					const searchTerm = value.toLowerCase();
					return (
						inquiry.name.toLowerCase().includes(searchTerm) ||
						inquiry.email.toLowerCase().includes(searchTerm) ||
						inquiry.phone.toLowerCase().includes(searchTerm)
					);
				},
			},
			{
				accessorKey: "packageId",
				header: "Package",
				cell: ({ row }) => {
					return (
						<div className="flex items-center">
							<Tag className="mr-2 h-4 w-4 text-muted-foreground" />
							<span>{row.original.packageId?.name || "Unknown Package"}</span>
						</div>
					);
				},
				accessorFn: (row) => row.packageId?._id,
				id: "packageId",
				filterFn: (row, id, value) => {
					if (!value || value.length === 0) return true;
					return value.includes(row.original.packageId?._id || "");
				},
			},
			{
				accessorKey: "date",
				header: "Date",
				cell: ({ row }) => {
					const date = new Date(row.original.date);
					return (
						<div className="flex items-center">
							<CalendarDots className="mr-2 h-4 w-4 text-muted-foreground" />
							<span>
								{isNaN(date.getTime())
									? "Invalid Date"
									: date.toLocaleDateString()}
							</span>
						</div>
					);
				},
			},
			{
				accessorKey: "numberOfPeople",
				header: "People",
				cell: ({ row }) => {
					return (
						<div className="flex items-center">
							<Users className="mr-2 h-4 w-4 text-muted-foreground" />
							<span>{row.original.numberOfPeople}</span>
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => getStatusBadge(row.original.status),
				filterFn: (row, id, value) => {
					return value.includes(row.getValue(id));
				},
			},
			{
				accessorKey: "createdAt",
				header: "Created At",
				cell: ({ row }) => {
					const date = new Date(row.original.createdAt);
					return !isNaN(date.getTime())
						? format(date, "PPP p")
						: "Invalid Date";
				},
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const inquiry = row.original;

					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<DotsThreeOutline className="h-4 w-4" weight="fill" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(inquiry.email);
										toast.success("Email copied to clipboard");
									}}
								>
									<Copy className="hover:text-background" />
									Copy email
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(inquiry.phone);
										toast.success("Phone number copied to clipboard");
									}}
								>
									<Copy className="hover:text-background" />
									Copy phone
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => {
										const currentSelection = { ...rowSelection };
										currentSelection[row.index] = true;
										setRowSelection(currentSelection);
										openStatusDialog("new");
									}}
								>
									<Clock className="hover:text-background" />
									Mark as New
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										const currentSelection = { ...rowSelection };
										currentSelection[row.index] = true;
										setRowSelection(currentSelection);
										openStatusDialog("contacted");
									}}
								>
									<PhoneCall className="hover:text-background" />
									Mark as Contacted
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										const currentSelection = { ...rowSelection };
										currentSelection[row.index] = true;
										setRowSelection(currentSelection);
										openStatusDialog("confirmed");
									}}
								>
									<CheckCircle className="hover:text-background" />
									Mark as Confirmed
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										const currentSelection = { ...rowSelection };
										currentSelection[row.index] = true;
										setRowSelection(currentSelection);
										openStatusDialog("cancelled");
									}}
								>
									<XCircle className="hover:text-background" />
									Mark as Cancelled
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[inquiries, rowSelection]
	);

	// Create package filter options
	const packageFilterOptions = packages.map((pkg) => ({
		label: pkg.name,
		value: pkg._id,
	}));

	// Create status filter options
	const statusFilterOptions = [
		{ label: "New", value: "new", icon: Clock },
		{ label: "Contacted", value: "contacted", icon: PhoneCall },
		{ label: "Confirmed", value: "confirmed", icon: CheckCircle },
		{ label: "Cancelled", value: "cancelled", icon: XCircle },
	];

	return (
		<>
			<div className="space-y-6">
				<div className="flex gap-2">
					<SidebarTrigger className="md:hidden" />
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">Inquiries</h1>
						<p className="text-muted-foreground">
							Manage booking inquiries from customers
						</p>
					</div>
				</div>

				<div className="flex justify-between items-center h-2">
					{selectedInquiryIds.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm text-muted-foreground">
								{selectedInquiryIds.length} selected
							</span>
							<Button
								size="sm"
								variant="outline"
								className="flex items-center"
								onClick={() => openStatusDialog("new")}
							>
								<Clock className="mr-2 h-4 w-4" />
								Mark as New
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="flex items-center"
								onClick={() => openStatusDialog("contacted")}
							>
								<PhoneCall className="mr-2 h-4 w-4" />
								Mark as Contacted
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="flex items-center"
								onClick={() => openStatusDialog("confirmed")}
							>
								<CheckCircle className="mr-2 h-4 w-4" />
								Mark as Confirmed
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="flex items-center text-destructive"
								onClick={() => openStatusDialog("cancelled")}
							>
								<XCircle className="mr-2 h-4 w-4" />
								Mark as Cancelled
							</Button>
						</div>
					)}
				</div>

				<Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
					<CardContent>
						<DataTable
							columns={columns}
							data={inquiries}
							isLoading={isLoading}
							pageCount={pagination.pageCount}
							onPaginationChange={handlePaginationChange}
							searchableColumns={[
								{
									id: "name",
									title: "name, email, phone",
								},
							]}
							filterableColumns={[
								{
									id: "packageId",
									title: "Package",
									options: packageFilterOptions,
								},
								{
									id: "status",
									title: "Status",
									options: statusFilterOptions,
								},
							]}
							dateFilterColumn={{
								id: "date",
								title: "Date",
							}}
							rowSelection={rowSelection}
							onRowSelectionChange={setRowSelection}
							onPackageFilterChange={handlePackageFilterChange}
							onStatusFilterChange={handleStatusFilterChange}
							onSearchChange={setSearchQuery}
							onDateChange={handleDateFilterChange}
						/>
					</CardContent>
				</Card>
			</div>

			<AlertDialog
				open={isStatusDialogOpen}
				onOpenChange={setIsStatusDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Update Inquiry Status</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to change the status of{" "}
							{selectedInquiryIds.length} inquiries to{" "}
							<span className="font-medium">
								{statusToUpdate === "new" && "New"}
								{statusToUpdate === "contacted" && "Contacted"}
								{statusToUpdate === "confirmed" && "Confirmed"}
								{statusToUpdate === "cancelled" && "Cancelled"}
							</span>
							?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setStatusToUpdate(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleStatusUpdate}>
							Update Status
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
