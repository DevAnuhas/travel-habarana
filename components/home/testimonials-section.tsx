"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import SectionHeading from "@/components/ui/section-heading";

// Testimonials data
const testimonials = [
	{
		content:
			"Our safari with Travel Habarana was the highlight of our Sri Lanka trip. We saw so many elephants up close and our guide was incredibly knowledgeable about wildlife behavior.",
		name: "Sarah Johnson",
		avatar: "",
		rating: 5,
	},
	{
		content:
			"The village tour was authentic and educational. The traditional lunch was delicious. A truly immersive cultural experience!",
		name: "Michael Chen",
		avatar: "",
		rating: 5,
	},
	{
		content:
			"Professional guides who really know their stuff. The luxury jeep was comfortable even on rough terrain, and they took us to the perfect spots for wildlife viewing.",
		name: "Emma Wilson",
		avatar: "",
		rating: 4,
	},
];

function TestimonialsSection() {
	return (
		<section className="py-20 px-4">
			<div className="container mx-auto">
				<SectionHeading
					title="What Our Guests Say?"
					subtitle="Don't just take our word for it - hear what our guests have to say about their adventures with us"
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							className="h-full rounded-lg p-6 md:p-8 bg-white shadow-sm border flex flex-col"
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02 }}
						>
							<div className="mb-6 text-primary">
								<Quotes size={48} weight="fill" />
							</div>
							<p className="text-sm italic mb-6 flex-grow">
								{testimonial.content}
							</p>
							<div className="flex justify-between items-center">
								<div className="flex justify-between items-center">
									<div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
										<Image
											src={
												testimonial.avatar || "/assets/avatar-placeholder.svg"
											}
											alt={testimonial.name}
											width={48}
											height={48}
											className="object-cover"
										/>
									</div>
									<h3 className="font-medium text-lg text-foreground">
										{testimonial.name}
									</h3>
								</div>

								<div className="flex justify-self-end space-x-1">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											size={16}
											className={
												i < testimonial.rating
													? "text-yellow-500"
													: "text-gray-300"
											}
											weight={i < testimonial.rating ? "fill" : "regular"}
										/>
									))}
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

export default TestimonialsSection;
