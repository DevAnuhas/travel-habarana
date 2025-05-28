import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

const getFriendlyColumnName = (columnId: string): string => {
	const columnNames: Record<string, string> = {
		select: "Select",
		name: "Name",
		packageId: "Package",
		date: "Date",
		numberOfPeople: "People",
		status: "Status",
		createdAt: "Created At",
		actions: "Actions",
	};
	return columnNames[columnId] || columnId;
};

export function DataTableViewOptions<TData>({
	table,
}: DataTableViewOptionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="ml-auto hidden h-9 lg:flex"
				>
					<SlidersHorizontal className="mr-2 h-4 w-4" />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" && column.getCanHide()
					)
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{getFriendlyColumnName(column.id)}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
