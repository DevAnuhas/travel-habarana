import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/ui/section-heading";

function PlanningStepCard({
	number,
	title,
	description,
	tip,
}: {
	number: number;
	title: string;
	description: string;
	tip: string;
}) {
	return (
		<motion.div
			className="relative bg-white/20 backdrop-blur-md rounded-xl overflow-hidden"
			initial={{
				opacity: 0,
				y: 20,
				boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.3)",
			}}
			whileInView={{ opacity: 1, y: 0 }}
			whileHover={{
				scale: 1.03,
				boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
			}}
			transition={{
				duration: 0.2,
			}}
			viewport={{ once: true }}
		>
			{/* Step number indicator */}
			<div className="absolute top-0 left-0 w-12 h-12 bg-primary text-white flex items-center justify-center text-xl font-bold font-serif rounded-br-xl z-10">
				{number}
			</div>

			<div className="pt-14 pb-6 px-6">
				<h3 className="text-xl font-bold mb-4">{title}</h3>
				<p className="text-gray-600 mb-4">{description}</p>
				<div className="relative bg-primary/10 p-4 rounded-lg">
					<p className="text-sm text-muted-foreground">{tip}</p>
				</div>
			</div>
		</motion.div>
	);
}

function PlanVisitSection() {
	return (
		<section className="py-20 px-4 relative overflow-hidden bg-gray-50">
			{/* Background gradient and overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-secondary/0 to-primary/0 opacity-70"></div>

			{/* Semi-transparent background */}
			<div className="absolute inset-0 w-full h-full opacity-25">
				<Image
					alt="Semi-transparent background"
					src="https://res.cloudinary.com/dsq09tlrm/image/upload/v1747309472/section-bg_sxd9qc.webp"
					fill
					className="object-cover"
				/>
			</div>

			<div className="container mx-auto relative">
				<SectionHeading
					title="Plan Your Visit"
					subtitle="Follow these simple steps to start your unforgettable tour"
				/>

				{/* Steps container */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto relative">
					{/* Step 1 */}
					<PlanningStepCard
						number={1}
						title="Explore & Inquire"
						description="Browse our safari and village tour packages, then submit an inquiry with your preferences."
						tip="Include your preferred dates in the inquiry!"
					/>

					{/* Step 2 */}
					<PlanningStepCard
						number={2}
						title="Get Confirmation"
						description="Our team will contact you to confirm pricing, availability, and details."
						tip="Have your travel dates ready for a smooth discussion!"
					/>

					{/* Step 3 */}
					<PlanningStepCard
						number={3}
						title="Prepare for Adventure"
						description="Once confirmed, pack your essentials and get ready for a thrilling experience."
						tip="Bring sunscreen, a hat, and a camera for the best experience!"
					/>
				</div>

				{/* Additional text and CTA Buttons */}
				<motion.div
					className="text-center mt-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.7 }}
					viewport={{ once: true }}
				>
					<p className="mb-8 max-w-2xl mx-auto">
						Have questions or need assistance? Contact us for a quick response!
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/contact">
							<Button size="lg">Contact Us</Button>
						</Link>
						<Link href="/book-now" className="group">
							<Button size="lg" variant={"secondary"}>
								Book Your Safari
								<ArrowRight className="ml-1 group-hover:translate-x-1 transition-all" />
							</Button>
						</Link>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

export default PlanVisitSection;
