"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CaretRight, CaretLeft, X } from "@phosphor-icons/react/dist/ssr";

export function ImageGallery({ images }: { images: string[] }) {
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
		images.length > 0
			? images
			: ["/images/placeholder.svg?height=500&width=800"];

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
							src={displayImages[currentIndex] || "/images/placeholder.svg"}
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
								src={image || "/images/placeholder.svg"}
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
							src={displayImages[currentIndex] || "/images/placeholder.svg"}
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
