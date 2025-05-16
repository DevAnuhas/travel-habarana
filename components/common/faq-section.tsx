import { useState } from "react";
import { motion } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react";
import SectionHeading from "@/components/ui/section-heading";

const faqs: Array<{ question: string; answer: string }> = [
	{
		question: "What is the best time for wildlife viewing?",
		answer:
			"The best time for wildlife safaris in Habarana is from May to October when water levels are low and animals gather around water holes. The famous Elephant Gathering peaks between July and September.",
	},
	{
		question: "Are your tours suitable for families with children?",
		answer:
			"Yes! Our tours are family-friendly and we can customize the experience based on the ages of your children. We provide extra safety measures and engaging activities for young wildlife enthusiasts.",
	},
	{
		question: "What should I bring for a safari?",
		answer:
			"We recommend bringing sunscreen, a hat, sunglasses, comfortable clothing, a camera, and binoculars if you have them. Water bottles and snacks are provided on all our safaris.",
	},
	{
		question: "How many people can fit in one safari jeep?",
		answer:
			"Our jeeps can comfortably accommodate up to 6 passengers plus the driver and guide. For larger groups, we can arrange multiple jeeps to ensure everyone enjoys the experience.",
	},
	{
		question: "Do you offer hotel pickup and drop-off?",
		answer:
			"Yes, we offer complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla. For hotels outside these areas, there may be an additional charge.",
	},
];

function FAQSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<SectionHeading
					title="Frequently Asked Questions"
					subtitle="Find answers to common questions about our safari and tour packages"
				/>
				<div className="max-w-3xl mx-auto mt-12 space-y-4">
					{faqs.map((faq, index) => (
						<motion.div
							key={index}
							className="overflow-hidden rounded-lg border border-gray-200 bg-white"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							viewport={{ once: true }}
						>
							<button
								className="flex w-full items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50"
								onClick={() => toggleFAQ(index)}
								aria-expanded={openIndex === index}
							>
								<span>{faq.question}</span>
								<CaretRight
									className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
										openIndex === index ? "rotate-90" : ""
									}`}
								/>
							</button>
							<div
								className={`overflow-hidden transition-all duration-300 ${
									openIndex === index ? "max-h-40 p-4 pt-0" : "max-h-0"
								}`}
							>
								<p className="text-gray-600">{faq.answer}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

export default FAQSection;
