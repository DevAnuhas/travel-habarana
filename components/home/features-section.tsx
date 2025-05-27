"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
	HandHeart,
	CalendarHeart,
	NavigationArrow,
	FlowerLotus,
	Image as ImageIcon,
	IconProps,
} from "@phosphor-icons/react";
import SectionHeading from "@/components/ui/section-heading";

const features: Array<Feature> = [
	{
		icon: HandHeart,
		title: "Safe & Insured",
		description:
			"All our safari jeeps are equipped with seatbelts and fully insured for your safety and peace of mind.",
		image:
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747400857/IMG_8961_ntttrb.jpg",
	},
	{
		icon: CalendarHeart,
		title: "Flexible Scheduling",
		description:
			"We offer year-round safari tours with special recommendations for the best wildlife viewing seasons.",
		image:
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747400905/IMG_8953_rirwyz.jpg",
	},
	{
		icon: NavigationArrow,
		title: "Passionate Guides",
		description:
			"Our experienced guides are passionate about wildlife and dedicated to creating memorable experiences.",
		image:
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747409645/Minneriya-National-park_nqlfvl.jpg",
	},
	{
		icon: FlowerLotus,
		title: "Authentic Experiences",
		description:
			"From safari adventures to cultural village tours, we provide authentic Sri Lankan experiences.",
		image:
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747400887/IMG_0422_g3orcr.jpg",
	},
];

export default function FeaturesSection() {
	return (
		<section className="relative overflow-hidden py-20 bg-gray-50">
			<div className="container max-w-5xl relative mx-auto px-4">
				<SectionHeading
					title="Why Travel Habarana?"
					subtitle="We pride ourselves on providing exceptional safari experiences and cultural tours in the heart of Sri Lanka. Our commitment to safety, authenticity, and customer satisfaction sets us apart."
				/>

				<div className="space-y-24">
					{features.map((feature, index) => (
						<FeatureItem key={index} feature={feature} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}

type Feature = {
	icon: React.ComponentType<IconProps>;
	title: string;
	description: string;
	image?: string;
};

function FeatureItem({ feature, index }: { feature: Feature; index: number }) {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

	const opacity = useTransform(
		scrollYProgress,
		[0, 0.2, 0.8, 1],
		[0.6, 1, 1, 0.6]
	);

	const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

	const isEven = index % 2 === 0;

	return (
		<div
			ref={ref}
			className={`grid gap-12 items-center ${
				isEven ? "md:grid-cols-[auto_1fr]" : "md:grid-cols-[1fr_auto]"
			}`}
		>
			<motion.div
				initial={{ opacity: 0, x: isEven ? -50 : 50 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className={`${!isEven && "md:order-2"}`}
			>
				<div className="flex gap-6">
					<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
						<feature.icon className="h-8 w-8 text-primary" />
					</div>
					<div className="max-w-xs">
						<h3 className="text-2xl font-bold pb-4">{feature.title}</h3>
						<p className="text-base text-muted-foreground">
							{feature.description}
						</p>
					</div>
				</div>
			</motion.div>

			<motion.div
				style={{
					y,
					opacity,
					scale,
					boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
				}}
				className={`relative h-[300px] md:h-[350px] rounded-lg overflow-hidden ${
					isEven ? "md:order-2" : "md:order-1"
				}`}
			>
				{feature.image ? (
					<Image
						src={feature.image}
						alt={feature.title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, 50vw"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-gray-400 bg-gray-200">
						<ImageIcon size={48} />
					</div>
				)}
			</motion.div>
		</div>
	);
}
