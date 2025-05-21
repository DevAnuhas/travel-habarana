"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
	CaretDoubleDown,
	FacebookLogo,
	InstagramLogo,
	TiktokLogo,
	WhatsappLogo,
	EnvelopeOpen,
	ArrowRight,
	IconProps,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

function SocialIcon({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: React.ComponentType<IconProps>;
	label: string;
}) {
	return (
		<motion.a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.95 }}
			aria-label={label}
		>
			<Icon size={24} weight="duotone" className="text-white" />
		</motion.a>
	);
}

function HeroSection() {
	return (
		<section className="relative h-screen">
			{/* Background image */}
			<AnimatePresence mode="wait">
				<motion.div
					className="absolute inset-0"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0.5 }}
					transition={{ duration: 1 }}
				>
					<Image
						src="https://res.cloudinary.com/dsq09tlrm/image/upload/v1747296498/hero-image_hmg1je.webp"
						alt="Sri Lankan Safari"
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-black/50" />
				</motion.div>
			</AnimatePresence>

			{/* Hero content */}
			<div className="relative h-full container mx-auto px-4 flex items-center">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 w-full">
					{/* Left side content */}
					<div className="lg:col-span-9 flex flex-col justify-center text-white text-center lg:text-left">
						<motion.h1
							className="text-5xl md:text-6xl lg:text-7xl leading-tight font-bold mb-4"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							Discover Sri Lanka’s Wildlife with Travel Habarana
						</motion.h1>

						<motion.p
							className="text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							Experience unforgettable safari adventures and authentic cultural
							tours in the heart of Sri Lanka
						</motion.p>

						<motion.div
							className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							<Link href="#packages">
								<Button size="lg">View Packages</Button>
							</Link>
							<Link href="/book-now" className="group">
								<Button variant="secondary" size="lg" className="">
									Book Now
									<ArrowRight className="ml-1 group-hover:translate-x-1 transition-all" />
								</Button>
							</Link>
						</motion.div>
					</div>

					{/* Right side social media links */}
					<div className="lg:col-span-3 flex items-center justify-center lg:justify-end">
						<motion.div
							className="flex flex-row md:flex-row lg:flex-col gap-4 mt-8 lg:mt-0"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 0.8 }}
						>
							<SocialIcon
								href="https://facebook.com/people/Jeep-safari-habarana/61557160063166/"
								icon={FacebookLogo}
								label="Facebook"
							/>
							<SocialIcon
								href="https://www.instagram.com/travel_in_habarana"
								icon={InstagramLogo}
								label="Instagram"
							/>
							<SocialIcon
								href="https://www.tiktok.com/@travel.in.habaran"
								icon={TiktokLogo}
								label="TikTok"
							/>
							<SocialIcon
								href="https://wa.me/+94766675883"
								icon={WhatsappLogo}
								label="WhatsApp"
							/>
							<SocialIcon
								href="mailto:fernandoprashan2003@icloud.com"
								icon={EnvelopeOpen}
								label="Email"
							/>
						</motion.div>
					</div>
				</div>

				{/* Scroll indicator at the bottom */}
				<motion.div
					className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 1 }}
				>
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
					>
						<CaretDoubleDown size={24} className="text-white" />
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

export default HeroSection;
