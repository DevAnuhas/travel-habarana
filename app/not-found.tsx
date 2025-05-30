"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { House, MagnifyingGlass, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-4xl mx-auto text-center">
				{/* Animated 404 */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-8"
				>
					<h1 className="text-8xl md:text-9xl font-bold text-primary mb-4">
						404
					</h1>
				</motion.div>

				{/* Main Content */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="mb-12"
				>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
						Oops! You’ve Wandered Off the Safari Trail
					</h2>
					<p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
						It looks like the page you’re looking for has gone on an adventure
						of its own.
					</p>
				</motion.div>

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
					className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
				>
					<Link href="/">
						<Button size={"lg"}>
							<House className="w-5 h-5 mr-2" />
							Back to Home
						</Button>
					</Link>

					<Link href="/packages">
						<Button size={"lg"}>
							<MagnifyingGlass className="w-5 h-5 mr-2" />
							Explore Packages
						</Button>
					</Link>
				</motion.div>

				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 1.1 }}
					className="mt-8"
				>
					<Button variant="link" onClick={() => window.history.back()}>
						<ArrowLeft className="w-4 h-4 mr-1" />
						Go Back
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
