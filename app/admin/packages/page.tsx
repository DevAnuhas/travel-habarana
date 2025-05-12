"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/spinner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { AdminLayout } from "@/components/admin/layout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { packageSchema } from "@/lib/types";

type PackageFormValues = z.input<typeof packageSchema>;
type Package = {
	_id: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
	createdAt: string;
	updatedAt: string;
};

export default function PackagesPage() {
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);

	const form = useForm<PackageFormValues>({
		resolver: zodResolver(packageSchema),
		defaultValues: {
			name: "",
			description: "",
			duration: "",
			included: [],
			images: [],
		},
	});

	useEffect(() => {
		fetchPackages();
	}, []);

	useEffect(() => {
		if (editingPackage) {
			form.reset({
				name: editingPackage.name,
				description: editingPackage.description,
				duration: editingPackage.duration,
				included: editingPackage.included,
				images: editingPackage.images,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				duration: "",
				included: [],
				images: [],
			});
		}
	}, [editingPackage, form]);

	const fetchPackages = async () => {
		try {
			setIsLoading(true);
			const res = await fetch("/api/packages");
			const data = await res.json();
			setPackages(data);
		} catch {
			toast.error("Failed to load packages");
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: PackageFormValues) => {
		setIsSubmitting(true);

		try {
			const url = editingPackage
				? `/api/packages/${editingPackage._id}`
				: "/api/packages";

			const method = editingPackage ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: data.name,
					description: data.description,
					duration: data.duration,
					included: data.included,
					images: data.images,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to save package");
			}

			toast.success(
				editingPackage
					? "Package updated successfully"
					: "Package created successfully"
			);
			setIsDialogOpen(false);
			fetchPackages();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "An error occurred");
			} else {
				toast.error("An unexpected error occurred");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this package?")) {
			return;
		}

		try {
			const res = await fetch(`/api/packages/${id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to delete package");
			}

			toast.success("Package deleted successfully");
			fetchPackages();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "An error occurred");
			} else {
				toast.error("An unexpected error occurred");
			}
		}
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Packages</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => setEditingPackage(null)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Package
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>
									{editingPackage ? "Edit Package" : "Add New Package"}
								</DialogTitle>
								<DialogDescription>
									{editingPackage
										? "Update the details of the existing package."
										: "Create a new safari or village tour package."}
								</DialogDescription>
							</DialogHeader>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Hurulu Eco Park Safari"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Embark on a thrilling jeep safari through Hurulu Eco Park..."
														rows={4}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="duration"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Duration</FormLabel>
												<FormControl>
													<Input placeholder="3 hours" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="included"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Included Items</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Luxury jeep
Water bottles
Snacks"
														rows={3}
														{...field}
														onChange={(e) => {
															// Split by newlines or commas and trim whitespace
															const value = e.target.value
																.split(/[\n,]/)
																.map((item) => item.trim())
																.filter((item) => item.length > 0);
															field.onChange(value);
														}}
														value={
															Array.isArray(field.value)
																? field.value.join("\n")
																: ""
														}
													/>
												</FormControl>
												<FormMessage />
												<p className="text-sm text-muted-foreground">
													Enter each item on a new line, or separate with commas
												</p>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="images"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Images</FormLabel>
												<FormControl>
													<Textarea
														placeholder="https://res.cloudinary.com/...
https://res.cloudinary.com/..."
														rows={3}
														{...field}
													/>
												</FormControl>
												<FormMessage />
												<p className="text-sm text-muted-foreground">
													Enter each image URL on a new line
												</p>
											</FormItem>
										)}
									/>
									<DialogFooter>
										<Button type="submit" disabled={isSubmitting}>
											{isSubmitting
												? "Saving..."
												: editingPackage
												? "Update Package"
												: "Create Package"}
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<LoadingSpinner />
					</div>
				) : packages.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center h-64">
							<p className="text-muted-foreground mb-4">No packages found</p>
							<Button onClick={() => setIsDialogOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Package
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{packages.map((pkg) => (
							<Card key={pkg._id}>
								<CardHeader className="pb-2">
									<CardTitle className="text-xl">{pkg.name}</CardTitle>
									<CardDescription>{pkg.duration}</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground line-clamp-3 mb-2">
										{pkg.description}
									</p>
									<div className="text-sm">
										<strong>Includes:</strong>
										<ul className="list-disc list-inside">
											{pkg.included.slice(0, 3).map((item, i) => (
												<li key={i}>{item}</li>
											))}
											{pkg.included.length > 3 && (
												<li>+ {pkg.included.length - 3} more</li>
											)}
										</ul>
									</div>
								</CardContent>
								<CardFooter className="flex justify-between">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setEditingPackage(pkg);
											setIsDialogOpen(true);
										}}
									>
										<Pencil className="mr-2 h-4 w-4" />
										Edit
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDelete(pkg._id)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
