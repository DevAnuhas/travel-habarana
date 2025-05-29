import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
	EnvelopeOpen,
	WhatsappLogo,
	MapPin,
	FacebookLogo,
	InstagramLogo,
	TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import FAQSection from "@/components/common/faq-section";

export const metadata: Metadata = {
	title: "Contact Us",
	description:
		"Get in touch with Travel Habarana for safari and village tour inquiries",
};

// Social media link component
function SocialLink({
	href,
	icon: Icon,
	label,
	color,
}: {
	href: string;
	icon: React.ElementType;
	label: string;
	color: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={`flex items-center justify-center w-12 h-12 rounded-full ${color} text-white transition-transform hover:scale-110`}
			aria-label={label}
		>
			<Icon size={24} />
		</a>
	);
}

export default function ContactPage() {
	return (
		<main className="pt-20">
			{/* Hero Section */}
			<section className="bg-primary text-white py-16 md:py-24">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
						Contact Us
					</h1>
					<p className="text-lg md:text-xl max-w-2xl mx-auto">
						Have questions or ready to book your safari adventure? Get in touch
						with our team.
					</p>
				</div>
			</section>

			{/* Contact Information Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						{/* Contact Card */}
						<div className="bg-white rounded-xl shadow-lg overflow-hidden">
							<div className="grid grid-cols-1 md:grid-cols-2">
								<div className="h-64 md:h-full bg-primary/10 relative">
									<Image
										src="https://res.cloudinary.com/travelhabarana/image/upload/v1747225191/cover_yulgqs.jpg"
										alt="Cover Image"
										fill
										className="object-cover"
									/>
								</div>

								{/* Contact Details */}
								<div className="p-8 md:p-10">
									<h2 className="text-2xl font-bold mb-6 text-gray-800">
										Get In Touch
									</h2>

									<div className="space-y-6">
										<div className="flex items-start">
											<div className="bg-primary/10 p-3 rounded-full mr-4">
												<WhatsappLogo className="h-6 w-6 text-primary" />
											</div>
											<div>
												<h3 className="font-bold text-lg">WhatsApp</h3>
												<p className="text-gray-600">+94 76 667 5883</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="bg-primary/10 p-3 rounded-full mr-4">
												<EnvelopeOpen className="h-6 w-6 text-primary" />
											</div>
											<div>
												<h3 className="font-bold text-lg">Email</h3>
												<p className="text-gray-600">
													fernandoprashan2003@icloud.com
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="bg-primary/10 p-3 rounded-full mr-4">
												<MapPin className="h-6 w-6 text-primary" />
											</div>
											<div>
												<h3 className="font-bold text-lg">Location</h3>
												<p className="text-gray-600">Habarana</p>
												<p className="text-gray-600">
													North Central Province, Sri Lanka
												</p>
											</div>
										</div>

										{/* Social Media Links */}
										<div>
											<h3 className="font-bold text-lg text-gray-800 mb-4">
												Connect With Us
											</h3>
											<div className="flex space-x-3">
												<SocialLink
													href="https://facebook.com/people/Jeep-safari-habarana/61557160063166/"
													icon={FacebookLogo}
													label="Facebook"
													color="bg-[#1877F2]"
												/>
												<SocialLink
													href="https://www.instagram.com/travel_in_habarana"
													icon={InstagramLogo}
													label="Instagram"
													color="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]"
												/>
												<SocialLink
													href="https://www.tiktok.com/@travel.in.habaran"
													icon={TiktokLogo}
													label="TikTok"
													color="bg-black"
												/>
											</div>
										</div>

										<div className="pt-4">
											<Button
												asChild
												className="w-full bg-primary hover:bg-primary"
											>
												<Link href="/book-now">Send Booking Inquiry</Link>
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<FAQSection />
		</main>
	);
}
