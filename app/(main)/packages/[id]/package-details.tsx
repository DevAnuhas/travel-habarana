"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	Clock,
	ListChecks,
	Check,
	CalendarDots,
	Users,
	ArrowRight,
	Share,
	Heart,
	Info,
	Phone,
	Image as ImageIcon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { favoritesManager } from "@/utils/favoritesManager";
import { siteConfig } from "@/config/site";

import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/ui/section-heading";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ImageGallery } from "@/components/ui/image-gallery";
import LoadingSpinner from "@/components/ui/spinner";

interface Package {
	_id: string;
	slug: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
}

export function PackageDetails({ id }: { id: string }) {
	const router = useRouter();
	const [packageData, setPackageData] = useState<Package | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);

	// Initialize the favorite state from localStorage
	useEffect(() => {
		if (packageData?._id) {
			setIsFavorite(favoritesManager.isFavorite(packageData._id));
		}
	}, [packageData]);

	const [relatedPackages, setRelatedPackages] = useState<Package[]>([]);
	const [isLoadingRelated, setIsLoadingRelated] = useState(true);

	const fetchRelatedPackages = useCallback(async () => {
		try {
			setIsLoadingRelated(true);
			const res = await fetch("/api/packages");

			if (!res.ok) {
				throw new Error("Failed to fetch related packages");
			}

			const data = await res.json();

			// Filter out the current package and limit to 3 packages
			const filtered = data
				.filter((pkg: Package) => pkg._id !== id)
				.slice(0, 3);

			setRelatedPackages(filtered);
		} catch (error) {
			console.error("Failed to fetch related packages:", error);
		} finally {
			setIsLoadingRelated(false);
		}
	}, [id]);

	useEffect(() => {
		const fetchPackage = async () => {
			try {
				setIsLoading(true);
				// Use cache: force-cache to leverage any server-side cached data
				const res = await fetch(`/api/packages/${id}`, {
					cache: "force-cache",
				});

				if (!res.ok) {
					throw new Error(`Package not found: ${res.status}`);
				}

				const data = await res.json();
				setPackageData(data);

				// Fetch related packages after main package is loaded
				fetchRelatedPackages();
			} catch (error) {
				console.error("Failed to fetch package:", error);
				toast.error("Failed to load package details. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchPackage();
		}
	}, [id, router, fetchRelatedPackages]);

	const toggleFavorite = () => {
		if (!packageData?._id) return;

		const newFavoriteState = !isFavorite;
		setIsFavorite(newFavoriteState);

		if (newFavoriteState) {
			favoritesManager.add(packageData._id);
			toast.success("Added to favorites");
		} else {
			favoritesManager.remove(packageData._id);
			toast.success("Removed from favorites");
		}
	};

	const sharePackage = () => {
		if (navigator.share) {
			navigator
				.share({
					title: packageData?.name || "Safari Package",
					text: "Check out this amazing safari package!",
					url: window.location.href,
				})
				.catch((err) => {
					console.error("Error sharing:", err);
				});
		} else {
			// Fallback for browsers that don’t support navigator.share
			navigator.clipboard.writeText(window.location.href);
			toast.success("Link copied to clipboard!");
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-96">
				<LoadingSpinner />
			</div>
		);
	}

	if (!packageData) {
		return (
			<div className="text-center py-24">
				<h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
				<p className="mb-6 text-gray-600">
					The package you’re looking for doesn’t exist or has been removed.
				</p>
				<Button asChild>
					<Link href="/packages">View All Packages</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Breadcrumbs */}
			<Breadcrumb className="mb-6">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/packages">Packages</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink>{packageData.name}</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Package Header */}
			<div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
				<h1 className="text-3xl md:text-4xl font-bold mb-2">
					{packageData.name}
				</h1>
				<div className="flex mt-4 md:mt-0 space-x-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									onClick={toggleFavorite}
									className={isFavorite ? "text-red-500" : ""}
								>
									<Heart weight={isFavorite ? "fill" : "regular"} size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{isFavorite ? "Remove from favorites" : "Add to favorites"}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon" onClick={sharePackage}>
									<Share size={18} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Share this package</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column - Images and Details */}
				<div className="lg:col-span-2">
					{/* Image Gallery */}
					<ImageGallery images={packageData.images} />

					{/* Package Details */}
					<div className="mt-8">
						{/* Description */}
						<div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
							<h2 className="text-xl font-bold mb-4 flex items-center">
								<Info className="mr-2 h-5 w-5 text-primary" />
								Description
							</h2>
							<p className="text-gray-700 leading-relaxed">
								{packageData.description}
							</p>
						</div>

						{/* What’s Included */}
						<div className="bg-white rounded-xl shadow-sm border p-6">
							<h2 className="text-xl font-bold mb-4 flex items-center">
								<ListChecks className="mr-2 h-5 w-5 text-primary" />
								What’s Included
							</h2>
							<ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{packageData.included.map((item, index) => (
									<li key={index} className="flex items-center">
										<div className="bg-primary/10 p-1 rounded-full mr-2">
											<Check size={12} className="text-primary" />
										</div>
										<span className="text-gray-700">{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Right Column - Booking Info */}
				<div>
					<div className="sticky top-24">
						{/* Booking Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
						>
							<h2 className="text-2xl font-bold mb-6 text-gray-800">
								Book This Package
							</h2>

							<div className="space-y-4 mb-6">
								<div className="flex items-start">
									<CalendarDots size={18} className="text-primary mr-3 mt-1" />
									<div>
										<h3 className="font-medium text-lg">Availability</h3>
										<p className="text-sm text-gray-600">
											Available daily, subject to weather conditions
										</p>
									</div>
								</div>

								<div className="flex items-start">
									<Users size={18} className="text-primary mr-3 mt-1" />
									<div>
										<h3 className="font-medium text-lg">Group Size</h3>
										<p className="text-sm text-gray-600">1-6 people per jeep</p>
									</div>
								</div>

								<div className="flex items-start">
									<Clock size={18} className="text-primary mr-3 mt-1" />
									<div>
										<h3 className="font-medium text-lg">Duration</h3>
										<p className="text-sm text-gray-600">
											{packageData.duration}
										</p>
									</div>
								</div>
							</div>

							<Button asChild className="w-full bg-primary hover:bg-primary">
								<Link
									href={`/book-now?packageId=${packageData._id}&slug=${
										packageData.slug || packageData._id
									}`}
								>
									Book Now
								</Link>
							</Button>

							<p className="text-sm text-gray-500 text-center mt-4">
								No payment required - we’ll get back to you within 24 hours with
								pricing and availability.
							</p>

							{/* Trust Indicators */}
							<div className="mt-6 pt-6 border-t border-gray-100">
								<div className="flex justify-center space-x-4">
									<div className="flex items-center">
										<Check className="h-4 w-4 text-primary mr-1" />
										<span className="text-xs text-gray-600">
											Free Cancellation
										</span>
									</div>
									<div className="flex items-center">
										<Check className="h-4 w-4 text-primary mr-1" />
										<span className="text-xs text-gray-600">
											Instant Confirmation
										</span>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Need Help Card */}
						<div className="mt-6 rounded-xl p-4 border">
							<h3 className="text-xl font-bold mb-2 text-gray-800">
								Need Help?
							</h3>
							<p className="text-sm text-gray-600 mb-3">
								Have questions about this package? Contact us directly:
							</p>
							<div className="flex items-center text-sm">
								<Phone size={14} className="mr-2 text-primary" />
								<span>{siteConfig.contact.phone}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Related Packages */}
			<section className="mt-16 py-16 border-t border-gray-200">
				<SectionHeading
					title="You Might Also Like"
					subtitle="Explore our other safari and cultural experiences"
				/>

				{isLoadingRelated ? (
					<div className="flex justify-center items-center h-48 mt-8">
						<LoadingSpinner />
					</div>
				) : relatedPackages.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
						{relatedPackages.map((pkg) => (
							<motion.div
								key={pkg._id}
								className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								viewport={{ once: true }}
								whileHover={{ y: -5 }}
							>
								<Link href={`/packages/${pkg.slug || pkg._id}`}>
									<div className="relative h-48 bg-gray-200">
										{pkg.images.length > 0 ? (
											<Image
												src={pkg.images[0]}
												alt={pkg.name}
												fill
												className="object-cover transition-transform duration-700 hover:scale-105"
											/>
										) : (
											<div className="flex h-full items-center justify-center text-gray-400 bg-gray-200">
												<ImageIcon size={48} />
											</div>
										)}
									</div>
									<div className="p-4">
										<h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{pkg.description}
										</p>
										<motion.div
											className="flex justify-end text-primary font-medium hover:text-primary group cursor-pointer"
											whileHover={{ x: 5 }}
										>
											<Button variant={"link"}>
												View Details
												<ArrowRight
													size={16}
													className="ml-1 group-hover:ml-2 transition-all"
												/>
											</Button>
										</motion.div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				) : (
					<div className="text-center py-12 text-gray-500 mt-8">
						<p>No related packages found</p>
					</div>
				)}
			</section>
		</>
	);
}
