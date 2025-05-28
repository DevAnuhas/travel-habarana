import * as React from "react";
import { debounce } from "lodash";
import { CalendarDots } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DataTableDateFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
}

export function DataTableDateFilter<TData, TValue>({
	column,
	title,
}: DataTableDateFilterProps<TData, TValue>) {
	// Get the current date from the column's filter value
	const currentDateStr = column?.getFilterValue() as string | undefined;
	const currentDate = currentDateStr ? new Date(currentDateStr) : undefined;

	// Handle date selection with debouncing
	const debouncedSetFilterValue = React.useMemo(
		() =>
			debounce((value: string | undefined) => {
				column?.setFilterValue(value);
			}, 500),
		[column]
	);

	// Cleanup debounced function on unmount
	React.useEffect(() => {
		return () => {
			debouncedSetFilterValue.cancel();
		};
	}, [debouncedSetFilterValue]);

	// Handle date selection
	const handleSelect = React.useCallback(
		(selectedDate: Date | undefined) => {
			const formattedDate = selectedDate
				? format(selectedDate, "yyyy-MM-dd")
				: undefined;
			debouncedSetFilterValue(formattedDate);
		},
		[debouncedSetFilterValue]
	);

	return (
		<div className="flex items-center">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className={cn(
							"h-9 border-dashed",
							currentDate && "bg-muted text-muted-foreground"
						)}
					>
						<CalendarDots className="mr-2 h-4 w-4" />
						{currentDate ? format(currentDate, "PPP") : title || "Pick a date"}
						{currentDate && (
							<Button
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									handleSelect(undefined);
								}}
								className="ml-2 h-4 w-4 p-0"
							>
								<span className="sr-only">Clear date</span>×
							</Button>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={currentDate}
						onSelect={handleSelect}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
