import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: "Thank You",
	description:
		"Thank you for your inquiry! Our team will get back to you soon.",
	robots: { index: false, follow: false },
};

export default function ThankYouPage() {
	return (
		<main className="pt-20">
			<section className="py-20 px-4">
				<div className="container mx-auto max-w-2xl text-center">
					<div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
						<div className="flex justify-center mb-6">
							<CheckCircle className="h-16 w-16 text-primary" />
						</div>

						<h1 className="text-3xl md:text-4xl font-bold mb-4">Thank You!</h1>

						<p className="text-lg text-gray-600 mb-8">
							Your inquiry has been successfully submitted. Our team will get
							back to you within 24 hours with pricing and availability.
						</p>

						<div className="space-y-4">
							<Button asChild>
								<Link href="/">Return to Home</Link>
							</Button>

							<div>
								<p className="text-sm text-gray-500 my-4">
									If you have any urgent questions, please contact us directly:
								</p>
								<p className="text-sm font-medium">
									WhatsApp:{" "}
									<a
										href={siteConfig.links.whatsapp}
										target="_blank"
										rel="noopener noreferrer"
										aria-label="WhatsApp"
										className="text-primary hover:underline"
									>
										+94 77 123 4567
									</a>{" "}
									<br />
									Email:{" "}
									<a
										href={siteConfig.links.email}
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Email"
										className="text-primary hover:underline"
									>
										fernandoprashan2003@icloud.com
									</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
