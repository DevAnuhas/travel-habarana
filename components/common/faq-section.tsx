"use client";

import { motion } from "framer-motion";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/ui/section-heading";
import { usePathname } from "next/navigation";

const safariFAQs: Array<{ question: string; answer: string }> = [
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

const bookingFAQs: Array<{ question: string; answer: string }> = [
	{
		question: "How far in advance should I book a safari?",
		answer:
			"We recommend booking at least 3-5 days in advance during regular season and 1-2 weeks during peak season (December-January and July-August) to ensure availability.",
	},
	{
		question: "Do you offer hotel pickup and drop-off?",
		answer:
			"Yes, we offer complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla. For hotels outside these areas, there may be an additional charge.",
	},
	{
		question: "What payment methods do you accept?",
		answer:
			"We accept cash, major credit cards, and bank transfers. For credit card payments, a small processing fee may apply.",
	},
	{
		question: "What is your cancellation policy?",
		answer:
			"Cancellations made 48 hours or more before the scheduled safari. Cancellations less than 24 hours in advance are non-refundable.",
	},
];

function FAQSection() {
	// Display different FAQs based on the current page
	const pathname = usePathname();
	const isHomePage = pathname === "/";
	const faqs = isHomePage ? safariFAQs : bookingFAQs;

	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<SectionHeading
					title="Frequently Asked Questions"
					subtitle={
						isHomePage
							? "Find answers to common questions about our safari and tour packages"
							: "Find answers to common questions about contacting and booking with us"
					}
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
