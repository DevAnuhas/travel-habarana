import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";
import SectionHeading from "@/components/ui/section-heading";

// Testimonials data
const testimonials = [
	{
		name: "Sarah Johnson",
		country: "United Kingdom",
		text: "Our safari with Travel Habarana was the highlight of our Sri Lanka trip. We saw so many elephants up close!",
		rating: 5,
	},
	{
		name: "Michael Chen",
		country: "Singapore",
		text: "The village tour was authentic and educational. The traditional lunch was delicious and the boat ride was peaceful.",
		rating: 5,
	},
	{
		name: "Emma Wilson",
		country: "Australia",
		text: "Professional guides who really know their stuff. The luxury jeep was comfortable even on rough terrain.",
		rating: 4,
	},
];

function TestimonialsSection() {
	return (
		<section className="py-20 px-4">
			<div className="container mx-auto">
				<SectionHeading
					title="Guest Experiences"
					subtitle="Don't just take our word for it - hear what our guests have to say about their adventures with us"
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							className="bg-white p-6 rounded-xl shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							viewport={{ once: true }}
						>
							<div className="flex mb-2">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										size={16}
										className={
											i < testimonial.rating
												? "text-yellow-500 fill-yellow-500"
												: "text-gray-300"
										}
									/>
								))}
							</div>
							<p className="text-gray-600 mb-4">
								&quot;{testimonial.text}&quot;
							</p>
							<div>
								<p className="font-bold">{testimonial.name}</p>
								<p className="text-sm text-gray-500">{testimonial.country}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

export default TestimonialsSection;
