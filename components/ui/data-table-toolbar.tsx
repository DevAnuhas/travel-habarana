import type React from "react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableDateFilter } from "./data-table-date-filter";
import { X } from "@phosphor-icons/react/dist/ssr";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
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
}

export function DataTableToolbar<TData>({
	table,
	filterableColumns = [],
	searchableColumns = [],
	dateFilterColumn,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;
	return (
		<div className="flex flex-col gap-4 md:flex-row justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-4">
				{searchableColumns.length > 0 && (
					<Input
						placeholder={`Search ${searchableColumns
							.map((column) => column.title)
							.join(", ")}...`}
						value={
							(table
								.getColumn(searchableColumns[0].id)
								?.getFilterValue() as string) ?? ""
						}
						onChange={(event) =>
							table
								.getColumn(searchableColumns[0].id)
								?.setFilterValue(event.target.value)
						}
						className="h-9 w-full md:w-[250px]"
					/>
				)}
				{filterableColumns.length > 0 &&
					filterableColumns.map(
						(column) =>
							table.getColumn(column.id) && (
								<DataTableFacetedFilter
									key={column.id}
									column={table.getColumn(column.id)}
									title={column.title}
									options={column.options}
								/>
							)
					)}
				{dateFilterColumn && table.getColumn(dateFilterColumn.id) && (
					<DataTableDateFilter
						column={table.getColumn(dateFilterColumn.id)}
						title={dateFilterColumn.title}
					/>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-9 px-2 lg:px-3 border"
					>
						Reset
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
