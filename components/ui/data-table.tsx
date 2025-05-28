"use client";

import * as React from "react";
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
	onPackageFilterChange?: (packageId: string | undefined) => void;
	onStatusFilterChange?: (status: string | undefined) => void;
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
	onPackageFilterChange,
	onStatusFilterChange,
	onSearchChange,
	onDateChange,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({});
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

	React.useEffect(() => {
		if (onPaginationChange) {
			onPaginationChange(pagination.pageIndex, pagination.pageSize);
		}
	}, [pagination, onPaginationChange]);

	React.useEffect(() => {
		// When column filters change, notify the parent about package and status filters
		const packageFilter = columnFilters.find((f) => f.id === "packageId");
		const statusFilter = columnFilters.find((f) => f.id === "status");

		if (packageFilter) {
			const values = packageFilter.value as string[];
			onPackageFilterChange?.(
				values && values.length > 0 ? values[0] : undefined
			);
		} else {
			onPackageFilterChange?.(undefined);
		}

		if (statusFilter) {
			const value = statusFilter.value as string[];
			onStatusFilterChange?.(value.length > 0 ? value[0] : undefined);
		} else {
			onStatusFilterChange?.(undefined);
		}

		// Notify parent of date changes
		const dateFilter = columnFilters.find((f) => f.id === "date");
		if (dateFilter) {
			// The value is already formatted as YYYY-MM-DD from the DataTableDateFilter
			const dateValue = dateFilter.value as string | undefined;
			onDateChange?.(dateValue);
		} else {
			onDateChange?.(undefined);
		}

		// Notify parent of search changes
		const searchFilter = columnFilters.find((f) => f.id === "name");
		const searchValue = searchFilter?.value as string | undefined;
		onSearchChange?.(searchValue || "");
	}, [
		columnFilters,
		onPackageFilterChange,
		onStatusFilterChange,
		onSearchChange,
		onDateChange,
	]);

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
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
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
		pageCount,
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
