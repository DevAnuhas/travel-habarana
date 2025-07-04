"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Clock,
	Check,
	ChatCircleDots,
	Image as ImageIcon,
} from "@phosphor-icons/react";
import { Button } from "./button";

interface PackageCardProps {
	id: string;
	slug?: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	image?: string;
}

export default function PackageCard({
	id,
	slug,
	name,
	description,
	duration,
	included,
	image,
}: PackageCardProps) {
	const packageIdentifier = slug || id;

	return (
		<motion.div
			className="bg-white rounded-xl overflow-hidden shadow-lg h-full flex flex-col"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true }}
			whileHover={{ y: -5 }}
		>
			<Link href={`/packages/${packageIdentifier}`} passHref>
				<div className="relative h-64 w-full overflow-hidden">
					{image ? (
						<Image
							src={image}
							alt={name}
							fill
							className="object-cover transition-transform duration-700 hover:scale-105"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-gray-400 bg-gray-200">
							<ImageIcon size={48} />
						</div>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
				</div>

				<div className="p-6 flex-grow flex flex-col">
					<div className="flex items-center mb-3">
						<Clock size={16} className="text-primary mr-2" />
						<span className="text-sm text-gray-600">{duration}</span>
					</div>

					<h3 className="text-xl font-bold mb-5">{name}</h3>

					<div className="mb-6">
						<h4 className="font-semibold text-sm mb-2 text-primary">
							Includes:
						</h4>
						<ul className="grid grid-cols-2 gap-0.5">
							{included.slice(0, 4).map((item, index) => (
								<li key={index} className="flex items-start mb-1">
									<Check
										size={16}
										className="text-primary mr-2 mt-1 flex-shrink-0"
									/>
									<span className="text-sm text-gray-600">{item}</span>
								</li>
							))}
						</ul>
					</div>

					<p className="text-gray-600 mb-6 flex-grow line-clamp-3">
						{description}
					</p>

					<div className="flex justify-between items-center gap-2">
						<span className="flex items-center gap-2 text-sm text-muted-foreground">
							<ChatCircleDots size={16} />
							Contact us for pricing & availability
						</span>
						<motion.div
							className="inline-flex items-center justify-center text-primary font-medium hover:text-primary group cursor-pointer"
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
				</div>
			</Link>
		</motion.div>
	);
}
