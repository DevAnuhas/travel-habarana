"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
	title: string;
	subtitle?: string;
	alignment?: "left" | "center";
}

export default function SectionHeading({
	title,
	subtitle,
	alignment = "center",
}: SectionHeadingProps) {
	const alignmentClasses = {
		left: "text-left",
		center: "text-center mx-auto",
	};

	return (
		<div
			className={`max-w-2xl flex flex-col items-center justify-center mb-12 ${alignmentClasses[alignment]}`}
		>
			<motion.h2
				className="text-3xl text-primary md:text-4xl font-bold mb-4"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
			>
				{title}
			</motion.h2>

			{subtitle && (
				<motion.p
					className="text-gray-600 max-w-xl"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					viewport={{ once: true }}
				>
					{subtitle}
				</motion.p>
			)}

			<motion.div
				className="w-24 h-1 bg-primary mt-6"
				initial={{ opacity: 0, width: 0 }}
				whileInView={{ opacity: 1, width: 96 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				viewport={{ once: true }}
				style={{
					marginLeft: alignment === "center" ? "auto" : 0,
					marginRight: alignment === "center" ? "auto" : 0,
				}}
			/>
		</div>
	);
}
