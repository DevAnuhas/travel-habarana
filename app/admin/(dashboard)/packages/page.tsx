"use client";

import { useState, useEffect } from "react";
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
import { packageSchema, type PackageInput } from "@/lib/types";
import type { FieldErrors } from "react-hook-form";
import { PackageLandingFields } from "@/components/admin/package-landing-fields";
import { ImageAltFields } from "@/components/admin/image-alt-fields";
import { Megaphone } from "@phosphor-icons/react";
import {
	PACKAGE_CATEGORIES,
	PACKAGE_CATEGORY_LABELS,
	PRICE_CURRENCIES,
	PRICE_UNITS,
	type PackageCategory,
	type PriceCurrency,
	type PriceUnit,
} from "@/lib/package-catalog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

type PackageFormValues = PackageInput;
type Package = {
	_id: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
	createdAt: string;
	updatedAt: string;
	category?: PackageCategory | null;
	sortOrder?: number | null;
	priceFrom?: number | null;
	priceCurrency?: PriceCurrency | null;
	priceUnit?: PriceUnit | null;
	priceNote?: string | null;
} & Partial<Pick<PackageInput, (typeof LANDING_KEYS)[number]>>;

const LANDING_KEYS = [
	"summary",
	"seoTitle",
	"seoDescription",
	"groupSize",
	"highlights",
	"notIncluded",
	"timeSlots",
	"pickupAreas",
	"whatToBring",
	"imageAlts",
	"itinerary",
	"faqs",
	"season",
] as const;

// Every optional field starts as null so the admin can clear a value (the API
// stores null; JSON.stringify would drop undefined and keep the old value).
const emptyOptionalFields = {
	category: null,
	sortOrder: null,
	priceFrom: null,
	priceCurrency: null,
	priceUnit: null,
	priceNote: null,
	summary: null,
	seoTitle: null,
	seoDescription: null,
	groupSize: null,
	highlights: null,
	notIncluded: null,
	timeSlots: null,
	pickupAreas: null,
	whatToBring: null,
	imageAlts: null,
	itinerary: null,
	faqs: null,
	season: null,
} as const;

// Which tab holds each field, so a failed save jumps to the first error.
const TAB_FOR_FIELD: Partial<Record<keyof PackageInput, string>> = {
	images: "images",
	imageAlts: "images",
	included: "included",
	...Object.fromEntries(
		LANDING_KEYS.filter((key) => key !== "imageAlts").map((key) => [
			key,
			"landing",
		])
	),
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
			...emptyOptionalFields,
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
				category: editingPackage.category ?? null,
				sortOrder: editingPackage.sortOrder ?? null,
				priceFrom: editingPackage.priceFrom ?? null,
				priceCurrency: editingPackage.priceCurrency ?? null,
				priceUnit: editingPackage.priceUnit ?? null,
				priceNote: editingPackage.priceNote ?? null,
				summary: editingPackage.summary ?? null,
				seoTitle: editingPackage.seoTitle ?? null,
				seoDescription: editingPackage.seoDescription ?? null,
				groupSize: editingPackage.groupSize ?? null,
				highlights: editingPackage.highlights ?? null,
				notIncluded: editingPackage.notIncluded ?? null,
				timeSlots: editingPackage.timeSlots ?? null,
				pickupAreas: editingPackage.pickupAreas ?? null,
				whatToBring: editingPackage.whatToBring ?? null,
				imageAlts: editingPackage.imageAlts ?? null,
				itinerary: editingPackage.itinerary ?? null,
				faqs: editingPackage.faqs ?? null,
				season: editingPackage.season ?? null,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				duration: "",
				included: [],
				images: [],
				...emptyOptionalFields,
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
					category: data.category ?? null,
					sortOrder: data.sortOrder ?? null,
					priceFrom: data.priceFrom ?? null,
					priceCurrency: data.priceCurrency ?? null,
					priceUnit: data.priceUnit ?? null,
					priceNote: data.priceNote?.trim() || null,
					summary: data.summary ?? null,
					seoTitle: data.seoTitle ?? null,
					seoDescription: data.seoDescription ?? null,
					groupSize: data.groupSize ?? null,
					highlights: data.highlights ?? null,
					notIncluded: data.notIncluded ?? null,
					timeSlots: data.timeSlots ?? null,
					pickupAreas: data.pickupAreas ?? null,
					whatToBring: data.whatToBring ?? null,
					itinerary: data.itinerary ?? null,
					faqs: data.faqs ?? null,
					season: data.season ?? null,
					// Drop descriptions of photos removed in this edit.
					imageAlts:
						data.imageAlts?.filter((entry) =>
							data.images.includes(entry.src)
						) ?? null,
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

	const onInvalid = (errors: FieldErrors<PackageFormValues>) => {
		const firstField = Object.keys(errors)[0] as keyof PackageInput | undefined;
		setActiveTab((firstField && TAB_FOR_FIELD[firstField]) ?? "general");
		toast.error("Please fix the highlighted fields");
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
				"category",
				"sortOrder",
				"priceFrom",
				"priceCurrency",
				"priceUnit",
				"priceNote",
			]);
			if (generalValid) {
				setActiveTab("images");
			}
		} else if (activeTab === "images") {
			// Validate images tab fields before proceeding
			const imagesValid = await form.trigger(["images", "imageAlts"]);
			if (imagesValid) {
				setActiveTab("included");
			}
		} else if (activeTab === "included") {
			const includedValid = await form.trigger(["included"]);
			if (includedValid) {
				setActiveTab("landing");
			}
		}
	};

	const handlePreviousTab = () => {
		if (activeTab === "landing") {
			setActiveTab("included");
		} else if (activeTab === "included") {
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
									onSubmit={form.handleSubmit(onSubmit, onInvalid)}
									className="space-y-4"
								>
									<Tabs value={activeTab} onValueChange={handleTabChange}>
										<TabsList className="grid grid-cols-4 mb-4 bg-primary/10">
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
											<TabsTrigger
												value="landing"
												className="flex items-center"
											>
												<Megaphone className="mr-2 h-4 w-4" />
												Landing page
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
													<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
														<FormField
															control={form.control}
															name="category"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Category</FormLabel>
																	<Select
																		value={field.value ?? ""}
																		onValueChange={(value) =>
																			field.onChange(value || null)
																		}
																	>
																		<FormControl>
																			<SelectTrigger className="w-full">
																				<SelectValue placeholder="Choose a category" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{PACKAGE_CATEGORIES.map((category) => (
																				<SelectItem key={category} value={category}>
																					{PACKAGE_CATEGORY_LABELS[category]}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="sortOrder"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Display order (1 shows first)</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			min={0}
																			max={999}
																			step={1}
																			value={field.value ?? ""}
																			onChange={(event) =>
																				field.onChange(
																					event.target.value === ""
																						? null
																						: Number(event.target.value)
																				)
																			}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
														<FormField
															control={form.control}
															name="priceFrom"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Price from (optional)</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			min={0}
																			step="any"
																			placeholder="45"
																			value={field.value ?? ""}
																			onChange={(event) =>
																				field.onChange(
																					event.target.value === ""
																						? null
																						: Number(event.target.value)
																				)
																			}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="priceCurrency"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Currency</FormLabel>
																	<Select
																		value={field.value ?? ""}
																		onValueChange={(value) =>
																			field.onChange(value || null)
																		}
																	>
																		<FormControl>
																			<SelectTrigger className="w-full">
																				<SelectValue placeholder="USD / LKR" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{PRICE_CURRENCIES.map((currency) => (
																				<SelectItem key={currency} value={currency}>
																					{currency}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="priceUnit"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Price covers</FormLabel>
																	<Select
																		value={field.value ?? ""}
																		onValueChange={(value) =>
																			field.onChange(value || null)
																		}
																	>
																		<FormControl>
																			<SelectTrigger className="w-full">
																				<SelectValue placeholder="per jeep" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{PRICE_UNITS.map((unit) => (
																				<SelectItem key={unit} value={unit}>
																					{unit}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													<FormField
														control={form.control}
														name="priceNote"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Price note (optional)</FormLabel>
																<FormControl>
																	<Input
																		placeholder="Park tickets not included"
																		value={field.value ?? ""}
																		onChange={(event) =>
																			field.onChange(event.target.value || null)
																		}
																	/>
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
													<ImageAltFields
														control={form.control}
														setValue={form.setValue}
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
														<div className="flex gap-2">
															<Button
																type="button"
																variant="outline"
																onClick={handleNextTab}
															>
																Landing page
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
														</div>
													</DialogFooter>
												</motion.div>
											)}

											{/* Landing Page Tab */}
											{activeTab === "landing" && (
												<motion.div
													key="landing"
													initial={{ opacity: 0, height: "fit-content" }}
													animate={{ opacity: 1, height: "fit-content" }}
													exit={{ opacity: 0, height: "fit-content" }}
													transition={{ duration: 0.3, ease: "easeInOut" }}
													className="space-y-4"
												>
													<PackageLandingFields
														key={editingPackage?._id ?? "new"}
														control={form.control}
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
										src={pkg.images[0]}
										alt={pkg.name}
										fill
										className="object-cover"
									/>
								) : (
									<div className="flex h-full items-center justify-center text-gray-400 bg-gray-200">
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
