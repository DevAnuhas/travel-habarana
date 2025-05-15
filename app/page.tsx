"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
	Shield,
	Users,
	MapPin,
	CaretDoubleDown,
	Star,
	Calendar,
	Clock,
	Sun,
	CloudRain,
} from "@phosphor-icons/react";

// Import custom components
import PackageCard from "@/components/ui/package-card";
import FeatureCard from "@/components/ui/feature-card";
import SectionHeading from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

interface Package {
	_id: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images?: string[];
}

export default function Home() {
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Fetch packages from API
	useEffect(() => {
		const fetchPackages = async () => {
			try {
				const res = await fetch("/api/packages");
				const data = await res.json();
				setPackages(data);
			} catch (error) {
				console.error("Failed to fetch packages:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPackages();
	}, []);

	// Hero image rotation effect
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	// Hero images
	const heroImages = [
		"https://res.cloudinary.com/dsq09tlrm/image/upload/v1747296498/hero-image_hmg1je.webp",
	];

	// Testimonials data
	const testimonials = [
		{
			name: "Sarah Johnson",
			country: "United Kingdom",
			text: "Our safari with Travel Habarana was the highlight of our Sri Lanka trip. We saw so many elephants up close!",
			rating: 5,
		},
		{
			name: "Michael Chen",
			country: "Singapore",
			text: "The village tour was authentic and educational. The traditional lunch was delicious and the boat ride was peaceful.",
			rating: 5,
		},
		{
			name: "Emma Wilson",
			country: "Australia",
			text: "Professional guides who really know their stuff. The luxury jeep was comfortable even on rough terrain.",
			rating: 4,
		},
	];

	return (
		<>
			{/* Hero Section */}
			<section className="relative h-screen">
				{/* Background image carousel */}
				<AnimatePresence mode="wait">
					<motion.div
						key={currentImageIndex}
						className="absolute inset-0"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0.5 }}
						transition={{ duration: 1 }}
					>
						<Image
							src={heroImages[currentImageIndex] || "/placeholder.svg"}
							alt="Sri Lankan Safari"
							fill
							priority
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-black/40" />
					</motion.div>
				</AnimatePresence>

				{/* Hero content */}
				<div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
					<motion.h1
						className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-wide mb-4 max-w-5xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						Discover Sri Lanka’s Wildlife with Travel Habarana
					</motion.h1>

					<motion.p
						className="text-lg md:text-xl mb-8 max-w-2xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						Experience unforgettable safari adventures and authentic cultural
						tours in the heart of Sri Lanka
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						<Link href="#packages">
							<Button size="lg">View Packages</Button>
						</Link>
						<Link href="/book-now">
							<Button variant="secondary" size="lg">
								Book Now
							</Button>
						</Link>
					</motion.div>

					<motion.div
						className="absolute bottom-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 1 }}
					>
						<motion.div
							animate={{ y: [0, 10, 0] }}
							transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
						>
							<CaretDoubleDown size={24} />
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Packages Section */}
			<section id="packages" className="py-20 px-4 bg-gray-50">
				<div className="container mx-auto">
					<SectionHeading
						title="Explore Our Safari & Village Tours"
						subtitle="Discover the beauty of Sri Lanka's wildlife and culture with our carefully crafted tour packages"
					/>

					{isLoading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
						</div>
					) : packages.length === 0 ? (
						// If API returns no packages, show fallback content
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<PackageCard
								id="hurulu"
								name="Hurulu Eco Park Safari"
								description="Explore a UNESCO biosphere with elephant sightings and diverse wildlife in their natural habitat."
								duration="Half Day (3-4 hours)"
								included={[
									"Luxury jeep with seatbelts",
									"Professional guide",
									"Water bottles",
									"Park entrance fees",
								]}
								image="/placeholder.svg?height=400&width=600"
							/>
							<PackageCard
								id="minneriya"
								name="Minneriya National Park Safari"
								description="Witness the famous Elephant Gathering, one of Asia's greatest wildlife spectacles."
								duration="Half Day (3-4 hours)"
								included={[
									"Luxury jeep with seatbelts",
									"Professional guide",
									"Water bottles",
									"Park entrance fees",
								]}
								image="/placeholder.svg?height=400&width=600"
							/>
							<PackageCard
								id="kaudulla"
								name="Kaudulla National Park Safari"
								description="Discover diverse wildlife year-round including elephants, deer, and numerous bird species."
								duration="Half Day (3-4 hours)"
								included={[
									"Luxury jeep with seatbelts",
									"Professional guide",
									"Water bottles",
									"Park entrance fees",
								]}
								image="/placeholder.svg?height=400&width=600"
							/>
							<PackageCard
								id="village"
								name="Cultural Village Tour"
								description="Immerse in local life with a traditional boat ride, farming experience, and authentic 9-curry lunch."
								duration="Full Day (6-7 hours)"
								included={[
									"Traditional boat ride",
									"Local guide",
									"9-curry lunch",
									"Farming experience",
								]}
								image="/placeholder.svg?height=400&width=600"
							/>
						</div>
					) : (
						// Display packages from API
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{packages.map((pkg) => (
								<PackageCard
									key={pkg._id}
									id={pkg._id}
									name={pkg.name}
									description={pkg.description}
									duration={pkg.duration}
									included={pkg.included}
									image={pkg.images?.[0]}
								/>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Plan Your Visit Section */}
			<section className="py-20 px-4">
				<div className="container mx-auto">
					<SectionHeading
						title="Plan Your Visit"
						subtitle="Everything you need to know to make the most of your safari adventure"
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
						<motion.div
							className="bg-white p-6 rounded-xl shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							viewport={{ once: true }}
						>
							<div className="text-primary mb-4">
								<Calendar size={40} />
							</div>
							<h3 className="text-xl font-bold mb-3">Best Time to Visit</h3>
							<p className="text-gray-600 mb-4">
								The dry season (May to September) offers the best wildlife
								viewing opportunities as animals gather around water holes.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Elephant Gathering: July-October</span>
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Bird Watching: December-March</span>
								</li>
							</ul>
						</motion.div>

						<motion.div
							className="bg-white p-6 rounded-xl shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							viewport={{ once: true }}
						>
							<div className="text-primary mb-4">
								<Clock size={40} />
							</div>
							<h3 className="text-xl font-bold mb-3">Safari Times</h3>
							<p className="text-gray-600 mb-4">
								We offer two daily safari sessions to maximize wildlife
								sightings during the most active periods.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Morning: 5:30 AM - 9:30 AM</span>
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Evening: 2:30 PM - 6:30 PM</span>
								</li>
							</ul>
						</motion.div>

						<motion.div
							className="bg-white p-6 rounded-xl shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							viewport={{ once: true }}
						>
							<div className="text-primary mb-4">
								<Sun size={40} />
							</div>
							<h3 className="text-xl font-bold mb-3">What to Bring</h3>
							<p className="text-gray-600 mb-4">
								Prepare for your safari adventure with these essential items for
								comfort and enjoyment.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Comfortable clothing & hat</span>
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Sunscreen & sunglasses</span>
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Camera & binoculars</span>
								</li>
							</ul>
						</motion.div>

						<motion.div
							className="bg-white p-6 rounded-xl shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							viewport={{ once: true }}
						>
							<div className="text-primary mb-4">
								<CloudRain size={40} />
							</div>
							<h3 className="text-xl font-bold mb-3">Weather</h3>
							<p className="text-gray-600 mb-4">
								Sri Lanka has a tropical climate with distinct wet and dry
								seasons that vary by region.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Dry Season: May to September</span>
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Wet Season: October to January</span>
								</li>
								<li className="flex items-center">
									<span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
									<span>Avg. Temp: 25-30°C (77-86°F)</span>
								</li>
							</ul>
						</motion.div>
					</div>

					<div className="text-center mt-12">
						<Link href="/book-now">
							<Button size="lg">Book Your Safari</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Why Choose Us Section */}
			<section className="py-20 px-4 bg-gray-50">
				<div className="container mx-auto">
					<SectionHeading
						title="Why Travel Habarana?"
						subtitle="We pride ourselves on providing safe, authentic, and unforgettable experiences for our guests"
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<FeatureCard
							icon={<Shield size={40} />}
							title="Luxury & Safety"
							description="Our fleet of modern jeeps are equipped with seatbelts, first aid kits, and comprehensive insurance for your peace of mind."
							delay={0.1}
						/>
						<FeatureCard
							icon={<MapPin size={40} />}
							title="Authentic Experiences"
							description="From traditional Oruwa boat rides to home-cooked 9-curry lunches, we offer genuine cultural immersion."
							delay={0.2}
						/>
						<FeatureCard
							icon={<Users size={40} />}
							title="Expert Guides"
							description="Our knowledgeable local guides speak fluent English and have years of experience spotting wildlife and sharing cultural insights."
							delay={0.3}
						/>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 px-4">
				<div className="container mx-auto">
					<SectionHeading
						title="Guest Experiences"
						subtitle="Don't just take our word for it - hear what our guests have to say about their adventures with us"
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								className="bg-white p-6 rounded-xl shadow-lg"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<div className="flex mb-2">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											size={16}
											className={
												i < testimonial.rating
													? "text-yellow-500 fill-yellow-500"
													: "text-gray-300"
											}
										/>
									))}
								</div>
								<p className="text-gray-600 mb-4">
									&quot;{testimonial.text}&quot;
								</p>
								<div>
									<p className="font-bold">{testimonial.name}</p>
									<p className="text-sm text-gray-500">{testimonial.country}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Banner */}
			<section className="relative py-20">
				<div className="absolute flex inset-0 bg-gray-900">
					<Image
						src="https://res.cloudinary.com/dsq09tlrm/image/upload/v1747225657/2_i0j9uk.png"
						alt="Sri Lankan landscape"
						fill
						className="object-cover object-center opacity-30"
					/>
				</div>

				<div className="relative container mx-auto px-4 text-center text-white">
					<motion.h2
						className="text-3xl md:text-4xl font-bold mb-6"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						viewport={{ once: true }}
					>
						Ready for an Adventure? Book Your Safari Today!
					</motion.h2>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						viewport={{ once: true }}
					>
						<Link href="/book-now">
							<Button size="lg">Send Inquiry</Button>
						</Link>
					</motion.div>
				</div>
			</section>
		</>
	);
}
