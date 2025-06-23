"use client";

import { useEffect } from "react";
import SectionHeading from "@/components/ui/section-heading";

function TestimonialsSection() {
	useEffect(() => {
		// Function to remove the Elfsight branding
		const removeElement = () => {
			const element = document.querySelector(
				".WidgetBackground__Content-sc-7c0ce009-2.fxmDQB.WidgetBackground__ContentContainer-sc > a:nth-child(3)"
			) as HTMLElement | null;

			if (element && element.parentNode) {
				element.parentNode.removeChild(element);
				return true;
			}
			return false;
		};

		if (!removeElement()) {
			// Set up an interval to keep trying until the element is found
			const intervalId = setInterval(() => {
				if (removeElement()) {
					clearInterval(intervalId);
				}
			}, 500);

			// Clean up interval on component unmount
			return () => clearInterval(intervalId);
		}
	}, []);

	return (
		<section className="py-20 px-4">
			<div className="container mx-auto">
				<SectionHeading
					title="What Our Guests Say?"
					subtitle="Don't just take our word for it - hear what our guests have to say about their adventures with us"
				/>
				<script
					src="https://static.elfsight.com/platform/platform.js"
					async
				></script>
				<div
					className="elfsight-app-6c7fd0eb-009c-4af4-b5f0-2669602f0f0b"
					data-elfsight-app-lazy
				></div>
			</div>
		</section>
	);
}

export default TestimonialsSection;
