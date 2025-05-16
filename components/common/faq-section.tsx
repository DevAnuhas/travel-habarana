import { motion } from "framer-motion";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
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
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<SectionHeading
					title="Frequently Asked Questions"
					subtitle="Find answers to common questions about our safari and tour packages"
				/>
				<div className="max-w-3xl mx-auto mt-12 space-y-4">
					<Accordion
						type="single"
						defaultValue="item-1"
						collapsible
						className="space-y-4"
					>
						{faqs.map((faq, index) => (
							<motion.div
								key={index}
								className="overflow-hidden rounded-lg border border-gray-200 bg-white"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<AccordionItem key={index} value={`item-${index + 1}`}>
									<AccordionTrigger className="p-4 text-sm sm:text-lg font-sans">
										{faq.question}
									</AccordionTrigger>
									<AccordionContent className="p-4 pt-2">
										{faq.answer}
									</AccordionContent>
								</AccordionItem>
							</motion.div>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}

export default FAQSection;
