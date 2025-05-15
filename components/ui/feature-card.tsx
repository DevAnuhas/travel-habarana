"use client";

import type React from "react";

import { motion } from "framer-motion";

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay?: number;
}

export default function FeatureCard({
	icon,
	title,
	description,
	delay = 0,
}: FeatureCardProps) {
	return (
		<motion.div
			className="bg-white p-6 rounded-xl shadow-lg"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			viewport={{ once: true }}
			whileHover={{ y: -5 }}
		>
			<div className="text-primary mb-4">{icon}</div>
			<h3 className="text-xl font-bold mb-3">{title}</h3>
			<p className="text-gray-600">{description}</p>
		</motion.div>
	);
}
