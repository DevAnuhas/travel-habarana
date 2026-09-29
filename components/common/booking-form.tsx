"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDots } from "@phosphor-icons/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { inquirySchema } from "@/lib/types";
import { isSelectableBookingDate } from "@/lib/booking-dates";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { CircleNotch } from "@phosphor-icons/react";

interface PackageOption {
	_id: string;
	name: string;
}

type FormValues = z.infer<typeof inquirySchema>;

export default function BookingForm({
	packages,
	initialPackageId = "",
}: {
	packages: PackageOption[];
	/** Resolved on the server (see lib/booking-prefill.ts), so the form needs no useSearchParams. */
	initialPackageId?: string;
}) {
	const router = useRouter();


	const [isSubmitting, setIsSubmitting] = useState(false);
	const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

	// Initialize the form with React Hook Form and Zod resolver
	const form = useForm<FormValues>({
		resolver: zodResolver(inquirySchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			packageId: initialPackageId,
			specialRequests: "",
			website: "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		setIsSubmitting(true);
		const submissionKey = idempotencyKey ?? globalThis.crypto.randomUUID();
		setIdempotencyKey(submissionKey);

		try {
			const formData = {
				...data,
				date: new Date(data.date).toISOString(),
				numberOfPeople: data.numberOfPeople,
				specialRequests: data.specialRequests,
			};

			const response = await fetch("/api/inquiries", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Idempotency-Key": submissionKey,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const result = await response.json().catch(() => null);
				throw new Error(result?.error || "Failed to submit inquiry");
			}

			toast.success(
				"Your inquiry has been submitted successfully! We'll contact you soon."
			);

			// Reset form
			form.reset();
			setIdempotencyKey(null);

			// Redirect to thank you page
			router.push("/thank-you");
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error("Failed to submit inquiry. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
			<h2 className="text-2xl font-bold mb-6">Send an Inquiry</h2>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<input
						{...form.register("website")}
						type="text"
						tabIndex={-1}
						autoComplete="off"
						aria-hidden="true"
						className="absolute -left-[9999px] size-px"
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name *</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Email */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address *</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="email@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Phone */}
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number *</FormLabel>
									<FormControl>
										<Input placeholder="+1 234 567 8900" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Package Selection */}
						<FormField
							control={form.control}
							name="packageId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Select Package *</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a package" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{packages.length === 0 ? (
												<SelectItem value="none" disabled>
													No packages available
												</SelectItem>
											) : (
												packages.map((pkg) => (
													<SelectItem key={pkg._id} value={pkg._id}>
														{pkg.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Date Selection */}
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Preferred Date *</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={`w-full justify-start text-left font-normal bg-transparent border-input ${
														!field.value && "text-muted-foreground"
													}`}
												>
													<CalendarDots className="mr-2 h-4 w-4" />
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={
													field.value ? new Date(field.value) : undefined
												}
												onSelect={(date) => field.onChange(date)}
												autoFocus
												disabled={(date) =>
													!isSelectableBookingDate(date, new Date())
												}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Number of People */}
						<FormField
							control={form.control}
							name="numberOfPeople"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Number of People *</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											max="50"
											step="1"
											value={field.value}
											onChange={(e) =>
												field.onChange(parseInt(e.target.value, 10))
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Special Requests */}
					<FormField
						control={form.control}
						name="specialRequests"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Special Requests (Optional)</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Any special requirements or questions?"
										className="resize-none h-24"
										rows={4}
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Let us know if you have any special requirements or questions.
									We’ll get back to you within 24 hours with pricing and
									availability.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<CircleNotch className="mr-1 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							<>Send Inquiry</>
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
