"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Clock,
	Check,
	ChatCircleDots,
} from "@phosphor-icons/react";
import { Button } from "./button";

interface PackageCardProps {
	id: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	image?: string;
}

export default function PackageCard({
	id,
	name,
	description,
	duration,
	included,
	image,
}: PackageCardProps) {
	return (
		<motion.div
			className="bg-white rounded-xl overflow-hidden shadow-lg h-full flex flex-col"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true }}
			whileHover={{ y: -5 }}
		>
			<div className="relative h-64 w-full overflow-hidden">
				<Image
					src={image || "/placeholder.svg?height=400&width=600"}
					alt={name}
					fill
					className="object-cover transition-transform duration-700 hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
			</div>

			<div className="p-6 flex-grow flex flex-col">
				<div className="flex items-center mb-3">
					<Clock size={16} className="text-primary mr-2" />
					<span className="text-sm text-gray-600">{duration}</span>
				</div>

				<h3 className="text-xl font-bold mb-3">{name}</h3>

				<p className="text-gray-600 mb-4 flex-grow">{description}</p>

				<div className="mb-4">
					<h4 className="font-semibold text-sm mb-2 text-primary">Includes:</h4>
					<ul>
						{included.slice(0, 3).map((item, index) => (
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

				<div className="flex justify-between items-center">
					<span className="flex items-center gap-2 text-sm text-muted-foreground">
						<ChatCircleDots size={16} />
						Contact us for pricing & availability
					</span>
					<Link href={`/packages/${id}`} passHref>
						<motion.div
							className="inline-flex items-center justify-center mt-2 text-primary font-medium hover:text-primary group cursor-pointer"
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
					</Link>
				</div>
			</div>
		</motion.div>
	);
}
