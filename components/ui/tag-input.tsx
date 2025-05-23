"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { X, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
}

export function TagInput({
	value = [],
	onChange,
	placeholder = "Add tag...",
}: TagInputProps) {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		// Add tag on Enter if there's input
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			addTag();
		}

		// Remove last tag on Backspace if input is empty
		else if (e.key === "Backspace" && !inputValue && value.length > 0) {
			removeTag(value.length - 1);
		}
	};

	const addTag = () => {
		const trimmedValue = inputValue.trim();

		if (!trimmedValue) return;

		// Don't add duplicates
		if (!value.includes(trimmedValue)) {
			onChange([...value, trimmedValue]);
		}

		setInputValue("");
		inputRef.current?.focus();
	};

	const removeTag = (index: number) => {
		const newTags = [...value];
		newTags.splice(index, 1);
		onChange(newTags);
	};

	return (
		<div className="border rounded-md p-1.5 flex flex-wrap gap-1.5">
			{/* Render existing tags */}
			{value.map((tag, index) => (
				<div
					key={index}
					className="flex items-center gap-1 bg-primary/10 text-primary text-sm px-2 py-1 rounded-md"
				>
					<span>{tag}</span>
					<button
						type="button"
						onClick={() => removeTag(index)}
						className="text-primary/70 hover:text-primary focus:outline-none"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}

			{/* Input for new tags */}
			<div className="flex-1 flex items-center min-w-[120px]">
				<Input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8 text-sm"
				/>
				{inputValue.trim() && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 ml-1"
						onClick={addTag}
					>
						<Plus className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
