import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

function CTABannerSection() {
	return (
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
					className="text-3xl md:text-4xl font-bold mb-4"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
				>
					Ready to Experience Sri Lanka with Us?
				</motion.h2>

				<motion.p
					className="text-white font-light max-w-xl mx-auto mb-8"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					viewport={{ once: true }}
				>
					Join us for an unforgettable adventure through Sri Lanka’s magnificent
					national parks and authentic village experiences. Our team is ready to
					create the perfect itinerary for your visit.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					viewport={{ once: true }}
				>
					<Link href="/book-now" className="group">
						<Button size="lg" variant={"secondary"}>
							Book Your Safari
							<ArrowRight className="ml-1 group-hover:translate-x-1 transition-all" />
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

export default CTABannerSection;
