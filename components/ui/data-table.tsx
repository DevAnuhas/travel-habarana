"use client";

import * as React from "react";
import { debounce } from "lodash";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import LoadingSpinner from "./spinner";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading?: boolean;
	pageCount?: number;
	onPaginationChange?: (pageIndex: number, pageSize: number) => void;
	filterableColumns?: {
		id: string;
		title: string;
		options: {
			label: string;
			value: string;
			icon?: React.ComponentType<{ className?: string }>;
		}[];
	}[];
	searchableColumns?: {
		id: string;
		title: string;
	}[];
	dateFilterColumn?: {
		id: string;
		title: string;
	};
	rowSelection?: Record<string, boolean>;
	onRowSelectionChange?: (
		updaterOrValue:
			| ((old: Record<string, boolean>) => Record<string, boolean>)
			| Record<string, boolean>
	) => void;
	onPackageFilterChange?: (packageIds: string[] | undefined) => void;
	onStatusFilterChange?: (statuses: string[] | undefined) => void;
	onSearchChange?: (searchQuery: string) => void;
	onDateChange?: (date: string | undefined) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading = false,
	pageCount,
	onPaginationChange,
	filterableColumns = [],
	searchableColumns = [],
	dateFilterColumn,
	rowSelection = {},
	onRowSelectionChange,
	onPackageFilterChange,
	onStatusFilterChange,
	onSearchChange,
	onDateChange,
}: DataTableProps<TData, TValue>) {
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	// Add isMounted ref to prevent initial effect trigger
	const isMounted = React.useRef(false);

	// Create a stable reference to the debounced filter handler
	const debouncedFilters = React.useMemo(
		() =>
			debounce((filters: ColumnFiltersState) => {
				// Only process filters if component is mounted
				if (!isMounted.current) return;

				// Handle package filter
				const packageFilter = filters.find((f) => f.id === "packageId");
				if (packageFilter) {
					const values = packageFilter.value as string[];
					onPackageFilterChange?.(
						values && values.length > 0 ? values : undefined
					);
				} else {
					onPackageFilterChange?.(undefined);
				}

				// Handle status filter
				const statusFilter = filters.find((f) => f.id === "status");
				if (statusFilter) {
					const values = statusFilter.value as string[];
					onStatusFilterChange?.(values.length > 0 ? values : undefined);
				} else {
					onStatusFilterChange?.(undefined);
				}

				// Handle date filter
				const dateFilter = filters.find((f) => f.id === "date");
				if (dateFilter) {
					const dateValue = dateFilter.value as string | undefined;
					onDateChange?.(dateValue);
				} else {
					onDateChange?.(undefined);
				}

				// Handle search filter
				const searchFilter = filters.find((f) => f.id === "name");
				const searchValue = searchFilter?.value as string | undefined;
				onSearchChange?.(searchValue || "");
			}, 300),
		[onPackageFilterChange, onStatusFilterChange, onDateChange, onSearchChange]
	);

	// Set isMounted after initial render
	React.useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
			debouncedFilters.cancel();
		};
	}, [debouncedFilters]);

	// Handle pagination changes
	React.useEffect(() => {
		if (onPaginationChange) {
			onPaginationChange(pagination.pageIndex, pagination.pageSize);
		}
	}, [pagination, onPaginationChange]);

	// Handle filter changes with debouncing
	React.useEffect(() => {
		debouncedFilters(columnFilters);
		return () => {
			debouncedFilters.cancel();
		};
	}, [columnFilters, debouncedFilters]);

	// Clean up stale row selections when data changes
	React.useEffect(() => {
		if (!onRowSelectionChange) return;

		const validIndices = data.map((_, i) => i.toString());
		const newSelection = Object.fromEntries(
			Object.entries(rowSelection).filter(([index]) =>
				validIndices.includes(index)
			)
		);
		if (Object.keys(newSelection).length !== Object.keys(rowSelection).length) {
			onRowSelectionChange(newSelection);
		}
	}, [data, rowSelection, onRowSelectionChange]);

	// Create table instance
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		pageCount,
		enableRowSelection: true,
		onRowSelectionChange: (updaterOrValue) => {
			if (onRowSelectionChange) {
				if (typeof updaterOrValue === "function") {
					onRowSelectionChange((old) => updaterOrValue(old));
				} else {
					onRowSelectionChange(updaterOrValue);
				}
			}
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		// Enable manual filtering and pagination since we're handling it server-side
		manualFiltering: true,
		manualPagination: true,
	});

	return (
		<div className="space-y-4">
			<DataTableToolbar
				table={table}
				filterableColumns={filterableColumns}
				searchableColumns={searchableColumns}
				dateFilterColumn={dateFilterColumn}
			/>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									<LoadingSpinner />
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
