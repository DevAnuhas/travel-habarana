import * as React from "react";
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
	onDateChange?: (date: string | undefined) => void;
}

export function DataTableDateFilter<TData, TValue>({
	column,
	title,
	onDateChange,
}: DataTableDateFilterProps<TData, TValue>) {
	const [date, setDate] = React.useState<Date | undefined>(
		column?.getFilterValue() as Date
	);

	const handleSelect = React.useCallback(
		(selectedDate: Date | undefined) => {
			const formattedDate = selectedDate
				? format(selectedDate, "yyyy-MM-dd")
				: undefined;
			const currentValue = column?.getFilterValue();

			if (formattedDate !== currentValue) {
				setDate(selectedDate);
				column?.setFilterValue(formattedDate);
				onDateChange?.(formattedDate);
			}
		},
		[column, onDateChange]
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
							date && "bg-muted text-muted-foreground"
						)}
					>
						<CalendarDots className="mr-2 h-4 w-4" />
						{date ? format(date, "PPP") : title || "Pick a date"}
						{date && (
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
						selected={date}
						onSelect={handleSelect}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
