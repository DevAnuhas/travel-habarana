"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Image from "next/image";
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
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagInput } from "@/components/ui/tag-input";
import { ImageUpload } from "@/components/ui/image-upload";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Plus,
	PencilSimpleLine,
	Trash,
	Image as ImageIcon,
	ListChecks,
	Info,
	CircleNotch,
} from "@phosphor-icons/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { packageSchema } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

type PackageFormValues = z.infer<typeof packageSchema>;
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

// TODO: This component should be refactored
export default function PackagesPage() {
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [activeTab, setActiveTab] = useState("general");

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
			form.reset();
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
		setIsSubmitting(true);
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
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value);
	};

	const handleNextTab = async () => {
		if (activeTab === "general") {
			// Validate general tab fields before proceeding
			const generalValid = await form.trigger([
				"name",
				"description",
				"duration",
			]);
			if (generalValid) {
				setActiveTab("images");
			}
		} else if (activeTab === "images") {
			// Validate images tab fields before proceeding
			const imagesValid = await form.trigger(["images"]);
			if (imagesValid) {
				setActiveTab("included");
			}
		}
	};

	const handlePreviousTab = () => {
		if (activeTab === "included") {
			setActiveTab("images");
		} else if (activeTab === "images") {
			setActiveTab("general");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex gap-2">
				<SidebarTrigger className="md:hidden" />
				<div className="flex justify-between items-center w-full">
					<h1 className="text-2xl md:text-3xl font-bold">Packages</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setEditingPackage(null);
									setActiveTab("general");
								}}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Package
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px] max-h-[700px] overflow-y-auto">
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
									<Tabs value={activeTab} onValueChange={handleTabChange}>
										<TabsList className="grid grid-cols-3 mb-4 bg-primary/10">
											<TabsTrigger
												value="general"
												className="flex items-center"
											>
												<Info className="mr-2 h-4 w-4" />
												General
											</TabsTrigger>
											<TabsTrigger value="images" className="flex items-center">
												<ImageIcon className="mr-2 h-4 w-4" />
												Images
											</TabsTrigger>
											<TabsTrigger
												value="included"
												className="flex items-center"
											>
												<ListChecks className="mr-2 h-4 w-4" />
												Included Items
											</TabsTrigger>
										</TabsList>

										<AnimatePresence mode="wait">
											{/* General Tab */}
											{activeTab === "general" && (
												<motion.div
													key="general"
													initial={{ opacity: 0, height: "fit-content" }}
													animate={{ opacity: 1, height: "fit-content" }}
													exit={{ opacity: 0, height: "fit-content" }}
													transition={{ duration: 0.3, ease: "easeInOut" }}
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
													<div className="flex justify-end">
														<Button type="button" onClick={handleNextTab}>
															Next
														</Button>
													</div>
												</motion.div>
											)}

											{/* Images Tab */}
											{activeTab === "images" && (
												<motion.div
													key="images"
													initial={{ opacity: 0, height: "min-content" }}
													animate={{ opacity: 1, height: "fit-content" }}
													exit={{ opacity: 0, height: "fit-content" }}
													transition={{ duration: 0.3, ease: "easeInOut" }}
													className="space-y-4"
												>
													<FormField
														control={form.control}
														name="images"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Images</FormLabel>
																<FormControl>
																	<ImageUpload
																		value={field.value}
																		onChange={field.onChange}
																		maxFiles={10}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<div className="flex justify-between">
														<Button
															type="button"
															variant="outline"
															onClick={handlePreviousTab}
														>
															Back
														</Button>
														<Button type="button" onClick={handleNextTab}>
															Next
														</Button>
													</div>
												</motion.div>
											)}

											{/* Included Items Tab */}
											{activeTab === "included" && (
												<motion.div
													key="included"
													initial={{ opacity: 0, height: "fit-content" }}
													animate={{ opacity: 1, height: "fit-content" }}
													exit={{ opacity: 0, height: "fit-content" }}
													transition={{ duration: 0.3, ease: "easeInOut" }}
													className="space-y-4"
												>
													<FormField
														control={form.control}
														name="included"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Included Items</FormLabel>
																<FormControl>
																	<TagInput
																		value={field.value}
																		onChange={field.onChange}
																		placeholder="Add an included item and press Enter..."
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<DialogFooter className="flex !justify-between">
														<Button
															type="button"
															variant="outline"
															onClick={handlePreviousTab}
														>
															Back
														</Button>
														<Button type="submit" disabled={isSubmitting}>
															{isSubmitting ? (
																<>
																	<CircleNotch className="mr-1 h-4 w-4 animate-spin" />
																	Saving...
																</>
															) : editingPackage ? (
																"Update Package"
															) : (
																"Create Package"
															)}
														</Button>
													</DialogFooter>
												</motion.div>
											)}
										</AnimatePresence>
									</Tabs>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
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
						<Card
							key={pkg._id}
							className="overflow-hidden hover:shadow-lg pt-0 trasition-shadow duration-200 border-0 shadow-md bg-white/80 backdrop-blur-sm"
						>
							{/* Package Image */}
							<div className="relative h-48 w-full bg-gray-100">
								{pkg.images && pkg.images.length > 0 ? (
									<Image
										src={pkg.images[0] || "/placeholder.svg"}
										alt={pkg.name}
										fill
										className="object-cover"
									/>
								) : (
									<div className="flex h-full items-center justify-center text-gray-400">
										<ImageIcon size={48} />
									</div>
								)}
							</div>

							<CardHeader>
								<CardTitle className="text-xl">{pkg.name}</CardTitle>
								<CardDescription>{pkg.duration}</CardDescription>
							</CardHeader>

							<CardContent>
								<p className="text-sm text-muted-foreground line-clamp-3 mb-4">
									{pkg.description}
								</p>
								<div className="text-sm">
									<strong>Includes:</strong>
									<div className="flex flex-wrap gap-1.5 mt-1">
										{pkg.included.slice(0, 3).map((item, i) => (
											<span
												key={i}
												className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
											>
												{item}
											</span>
										))}
										{pkg.included.length > 3 && (
											<span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
												+{pkg.included.length - 3} more
											</span>
										)}
									</div>
								</div>
							</CardContent>

							<CardFooter className="flex justify-between">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setEditingPackage(pkg);
										setActiveTab("general");
										setIsDialogOpen(true);
									}}
								>
									<PencilSimpleLine className="mr-2 h-4 w-4" />
									Edit
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" size="sm">
											<Trash className="mr-2 h-4 w-4" />
											Delete
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Are you absolutely sure?
											</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This will permanently
												delete the package and remove it from our servers.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => handleDelete(pkg._id)}
												disabled={isSubmitting}
												className="bg-destructive hover:bg-destructive/90"
											>
												{isSubmitting ? (
													<>
														<CircleNotch className="mr-1 h-4 w-4 animate-spin" />
														Deleting...
													</>
												) : (
													<>Delete</>
												)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
