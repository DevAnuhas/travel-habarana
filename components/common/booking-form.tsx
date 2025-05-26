"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDots } from "@phosphor-icons/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { inquirySchema } from "@/lib/types";
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

interface Package {
	_id: string;
	name: string;
}

type FormValues = z.infer<typeof inquirySchema>;

export default function BookingForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Safely access the packageId from searchParams
	const packageIdFromUrl = searchParams ? searchParams.get("packageId") : null;

	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize the form with React Hook Form and Zod resolver
	const form = useForm<FormValues>({
		resolver: zodResolver(inquirySchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			packageId: packageIdFromUrl || "",
			specialRequests: "",
		},
	});

	// Fetch packages
	useEffect(() => {
		const fetchPackages = async () => {
			try {
				const res = await fetch("/api/packages");
				const data = await res.json();
				setPackages(data);

				// If packageId is provided in URL, select it
				if (
					packageIdFromUrl &&
					data.some((pkg: Package) => pkg._id === packageIdFromUrl)
				) {
					form.setValue("packageId", packageIdFromUrl);
				}
			} catch (error) {
				console.error("Failed to fetch packages:", error);
				toast.error("Failed to load packages. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPackages();
	}, [packageIdFromUrl, form]);

	const onSubmit = async (data: FormValues) => {
		setIsSubmitting(true);

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
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error("Failed to submit inquiry");
			}

			toast.success(
				"Your inquiry has been submitted successfully! We'll contact you soon."
			);

			// Reset form
			form.reset();

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
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="bg-white rounded-xl shadow-lg p-6 md:p-8"
		>
			<h2 className="text-2xl font-bold mb-6">Send an Inquiry</h2>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a package" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{isLoading ? (
												<SelectItem value="loading" disabled>
													Loading packages...
												</SelectItem>
											) : packages.length === 0 ? (
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
												initialFocus
												disabled={(date) => date < new Date()}
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
		</motion.div>
	);
}
