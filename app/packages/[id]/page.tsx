"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
	Clock,
	ListChecks,
	Check,
	CalendarDots,
	Users,
	CaretRight,
	CaretLeft,
	X,
	Share,
	Heart,
	Info,
	Phone,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

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
import LoadingSpinner from "@/components/ui/spinner";

// Custom CSS to hide scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

interface Package {
	_id: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
}

// Image Gallery Component
function ImageGallery({ images }: { images: string[] }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [showFullGallery, setShowFullGallery] = useState(false);
	const [isPlaying, setIsPlaying] = useState(true);

	// Add useEffect for automatic slideshow
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isPlaying) {
			interval = setInterval(() => {
				setCurrentIndex((prev) => (prev + 1) % images.length);
			}, 5000); // Change image every 5 seconds
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isPlaying, images.length]);

	// Pause slideshow when user interacts with gallery
	const pauseSlideshow = () => {
		setIsPlaying(false);
	};

	const nextImage = () => {
		pauseSlideshow();
		setCurrentIndex((prev) => (prev + 1) % images.length);
		setIsPlaying(true);
	};

	const prevImage = () => {
		pauseSlideshow();
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
		setIsPlaying(true);
	};

	const goToImage = (index: number) => {
		pauseSlideshow();
		setCurrentIndex(index);
		setIsPlaying(true);
	};

	// Ensure we have at least one image
	const displayImages =
		images.length > 0 ? images : ["/placeholder.svg?height=500&width=800"];

	return (
		<div className="relative">
			{/* Main image */}
			<div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentIndex}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5 }}
						className="absolute inset-0"
					>
						<Image
							src={displayImages[currentIndex] || "/placeholder.svg"}
							alt={`Package image ${currentIndex + 1}`}
							fill
							className="object-cover"
							priority={currentIndex === 0}
						/>
					</motion.div>
				</AnimatePresence>

				{/* Navigation arrows */}
				<button
					onClick={prevImage}
					className="absolute left-4 top-1/2 z-10 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
					aria-label="Previous image"
				>
					<CaretLeft size={24} />
				</button>
				<button
					onClick={nextImage}
					className="absolute right-4 top-1/2 z-10 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
					aria-label="Next image"
				>
					<CaretRight size={24} />
				</button>

				{/* Image counter */}
				<div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
					{currentIndex + 1} / {displayImages.length}
				</div>

				{/* View all button */}
				{displayImages.length > 1 && (
					<button
						onClick={() => {
							setShowFullGallery(true);
							pauseSlideshow();
						}}
						className="absolute bottom-4 left-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-sm transition-colors"
					>
						View all photos
					</button>
				)}
			</div>

			{/* Thumbnail strip */}
			{displayImages.length > 1 && (
				<div className="flex mt-4 space-x-2 overflow-x-auto pb-2 scrollbar-hide">
					{displayImages.map((image, index) => (
						<button
							key={index}
							onClick={() => goToImage(index)}
							className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden transition-all ${
								currentIndex === index
									? "border-primary border-2"
									: "opacity-70 hover:opacity-100"
							}`}
						>
							<Image
								src={image || "/placeholder.svg"}
								alt={`Thumbnail ${index + 1}`}
								fill
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}

			{/* Full gallery modal */}
			{showFullGallery && (
				<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
					<button
						onClick={() => {
							setShowFullGallery(false);
							setIsPlaying(true);
						}}
						className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full"
						aria-label="Close gallery"
					>
						<X size={24} />
					</button>

					<div className="relative w-full max-w-4xl h-[80vh]">
						<Image
							src={displayImages[currentIndex] || "/placeholder.svg"}
							alt={`Full size image ${currentIndex + 1}`}
							fill
							className="object-contain"
						/>

						<button
							onClick={prevImage}
							className="absolute left-4 top-1/2 z-10 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
							aria-label="Previous image"
						>
							<CaretLeft size={24} />
						</button>

						<button
							onClick={nextImage}
							className="absolute right-4 top-1/2 z-10 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
							aria-label="Next image"
						>
							<CaretRight size={24} />
						</button>

						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
							{displayImages.map((_, index) => (
								<button
									key={index}
									onClick={() => goToImage(index)}
									className={`w-2 h-2 rounded-full ${
										currentIndex === index ? "bg-white" : "bg-white/50"
									}`}
									aria-label={`Go to image ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Package Details Component
function PackageDetails({ id }: { id: string }) {
	const router = useRouter();
	const [packageData, setPackageData] = useState<Package | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [relatedPackages, setRelatedPackages] = useState<Package[]>([]);
	const [isLoadingRelated, setIsLoadingRelated] = useState(true);

	const fetchRelatedPackages = async () => {
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
	};

	useEffect(() => {
		const fetchPackage = async () => {
			try {
				const res = await fetch(`/api/packages/${id}`);

				if (!res.ok) {
					throw new Error("Package not found");
				}

				const data = await res.json();
				setPackageData(data);

				// Fetch related packages after main package is loaded
				fetchRelatedPackages();
			} catch (error) {
				console.error("Failed to fetch package:", error);
				toast.error("Failed to load package details. Please try again.");
				router.push("/packages");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPackage();
	}, [id, router]);

	const toggleFavorite = () => {
		setIsFavorite(!isFavorite);

		toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
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
			<div className="text-center py-16">
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
								<Link href={`/book-now?packageId=${packageData._id}`}>
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
								<span>+94 76 667 5883</span>
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
								<div className="relative h-48 bg-gray-200">
									<Image
										src={
											pkg.images?.[0] || "/placeholder.svg?height=400&width=600"
										}
										alt={pkg.name}
										fill
										className="object-cover"
									/>
								</div>
								<div className="p-4">
									<h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
									<p className="text-sm text-gray-600 mb-3 line-clamp-2">
										{pkg.description}
									</p>
									<Link href={`/packages/${pkg._id}`}>
										<Button variant="link" className="!p-0">
											View Details
											<CaretRight size={16} className="ml-1" />
										</Button>
									</Link>
								</div>
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

export default function PackageDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	return (
		<main className="pt-20 bg-gray-50">
			<style jsx global>
				{scrollbarHideStyles}
			</style>
			<div className="container mx-auto px-4 py-8">
				<Suspense
					fallback={
						<div className="flex justify-center items-center h-screen">
							<LoadingSpinner />
						</div>
					}
				>
					<PackageDetails id={params.id} />
				</Suspense>
			</div>
		</main>
	);
}
