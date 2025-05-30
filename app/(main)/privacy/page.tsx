import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Privacy Policy for Travel Habarana - How we collect, use, and protect your personal information",
};

export default function PrivacyPolicyPage() {
	return (
		<main className="bg-gray-50 min-h-screen py-20">
			<div className="container mx-auto py-12 px-4 max-w-4xl">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
					<p className="text-lg text-gray-600">Last updated: May 30, 2025</p>
				</div>

				<Card className="shadow-sm">
					<CardContent className="p-8 space-y-8">
						{/* Introduction */}
						<section className="mb-4">
							<h2 className="text-2xl font-semibold mb-4">Introduction</h2>
							<p className="text-gray-700 leading-relaxed">
								Travel Habarana (“we,” “our,” or “us”) is committed to
								protecting your privacy. This Privacy Policy explains how we
								collect, use, disclose, and safeguard your information when you
								visit our website, book our services, or interact with us in any
								way. Please read this privacy policy carefully. If you do not
								agree with the terms of this privacy policy, please do not
								access the site or use our services.
							</p>
						</section>

						<Separator />

						{/* Information We Collect */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								Information We Collect
							</h2>

							<h3 className="text-xl font-medium text-gray-800 mb-3">
								Personal Information
							</h3>
							<p className="text-gray-700 leading-relaxed mb-4">
								We may collect personal information that you voluntarily provide
								to us when you:
							</p>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2 mb-6"
							>
								<li>
									Make a booking or inquiry for our safari tours and travel
									packages
								</li>
								<li>
									Contact us through our contact forms or customer support
								</li>
							</ul>

							<p className="text-gray-700 leading-relaxed mb-4">
								This information may include:
							</p>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2 mb-6"
							>
								<li>
									Full name and contact information (email address, phone
									number, mailing address)
								</li>
								<li>Travel preferences and special requirements</li>
								<li>
									Payment information (processed securely through third-party
									payment processors)
								</li>
								<li>
									Passport and identification details (when required for
									bookings)
								</li>
								<li>Emergency contact information</li>
								<li>
									Dietary restrictions and medical information relevant to your
									travel
								</li>
							</ul>

							<h3 className="text-xl font-medium text-gray-800 mb-3">
								Automatically Collected Information
							</h3>
							<p className="text-gray-700 leading-relaxed mb-4">
								When you visit our website, we may automatically collect certain
								information about your device and usage patterns, including:
							</p>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2"
							>
								<li>IP address and browser type</li>
								<li>Operating system and device information</li>
								<li>Pages visited and time spent on our website</li>
								<li>Referring website and search terms used</li>
								<li>Cookies and similar tracking technologies</li>
							</ul>
						</section>

						<Separator />

						{/* How We Use Your Information */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								How We Use Your Information
							</h2>
							<p className="text-gray-700 leading-relaxed mb-4">
								We use the information we collect for the following purposes:
							</p>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2"
							>
								<li>
									Process and manage your bookings and travel arrangements
								</li>
								<li>Provide customer support and respond to your inquiries</li>
								<li>
									Send booking confirmations, updates, and travel-related
									information
								</li>
								<li>Improve our website functionality and user experience</li>
								<li>Send marketing communications (with your consent)</li>
								<li>Comply with legal obligations and protect our rights</li>
								<li>Prevent fraud and ensure the security of our services</li>
								<li>Analyze website usage and improve our services</li>
							</ul>
						</section>

						<Separator />

						{/* Information Sharing */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								How We Share Your Information
							</h2>
							<p className="text-gray-700 leading-relaxed mb-4">
								We may share your information in the following circumstances:
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-3">
								Service Providers
							</h3>
							<p className="text-gray-700 leading-relaxed mb-4">
								We may share your information with trusted third-party service
								providers who assist us in operating our business, including:
							</p>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2 mb-6"
							>
								<li>Payment processors for secure transaction processing</li>
								<li>Email service providers for communication</li>
								<li>Cloud storage and hosting providers</li>
								<li>Local tour operators and accommodation providers</li>
								<li>Transportation providers</li>
							</ul>

							<h3 className="text-xl font-medium text-gray-800 mb-3">
								Legal Requirements
							</h3>
							<p className="text-gray-700 leading-relaxed mb-4">
								We may disclose your information if required by law or in
								response to valid requests by public authorities, including to
								meet national security or law enforcement requirements.
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-3">
								Business Transfers
							</h3>
							<p className="text-gray-700 leading-relaxed">
								In the event of a merger, acquisition, or sale of assets, your
								information may be transferred as part of the business
								transaction.
							</p>
						</section>

						<Separator />

						{/* Data Security */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">Data Security</h2>
							<p className="text-gray-700 leading-relaxed">
								We implement appropriate technical and organizational security
								measures to protect your personal information against
								unauthorized access, alteration, disclosure, or destruction.
								However, please note that no method of transmission over the
								internet or electronic storage is 100% secure, and we cannot
								guarantee absolute security.
							</p>
						</section>

						<Separator />

						{/* Cookies and Tracking */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								Cookies and Tracking Technologies
							</h2>
							<p className="text-gray-700 leading-relaxed mb-4">
								We use cookies and similar tracking technologies to enhance your
								browsing experience, analyze website traffic, and personalize
								content. You can control cookie settings through your browser
								preferences, though disabling cookies may affect website
								functionality.
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-3">
								Types of Cookies We Use:
							</h3>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2"
							>
								<li>Essential cookies for website functionality</li>
								<li>Analytics cookies to understand website usage</li>
								<li>
									Marketing cookies for personalized advertising (with consent)
								</li>
								<li>Preference cookies to remember your settings</li>
							</ul>
						</section>

						<Separator />

						{/* Your Rights */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								Your Privacy Rights
							</h2>
							<p className="text-gray-700 leading-relaxed mb-4">
								Depending on your location, you may have the following rights
								regarding your personal information:
							</p>
							<ul
								style={{ paddingLeft: "2rem", listStyleType: "disc" }}
								className="text-gray-700 space-y-2 mb-4"
							>
								<li>
									Access: Request a copy of the personal information we hold
									about you
								</li>
								<li>
									Correction: Request correction of inaccurate or incomplete
									information
								</li>
								<li>Deletion: Request deletion of your personal information</li>
								<li>
									Portability: Request transfer of your data to another service
									provider
								</li>
								<li>
									Objection: Object to certain processing of your personal
									information
								</li>
								<li>
									Restriction: Request restriction of processing in certain
									circumstances
								</li>
							</ul>
							<p className="text-gray-700 leading-relaxed">
								To exercise these rights, please contact us using the
								information provided below. We will respond to your request
								within a reasonable timeframe and in accordance with applicable
								law.
							</p>
						</section>

						<Separator />

						{/* Data Retention */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
							<p className="text-gray-700 leading-relaxed">
								We retain your personal information only for as long as
								necessary to fulfill the purposes outlined in this privacy
								policy, comply with legal obligations, resolve disputes, and
								enforce our agreements. When we no longer need your information,
								we will securely delete or anonymize it.
							</p>
						</section>

						<Separator />

						{/* Third-Party Links */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">Third-Party Links</h2>
							<p className="text-gray-700 leading-relaxed">
								Our website may contain links to third-party websites. We are
								not responsible for the privacy practices or content of these
								external sites. We encourage you to review the privacy policies
								of any third-party websites you visit.
							</p>
						</section>

						<Separator />

						{/* Children’s Privacy */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								Children’s Privacy
							</h2>
							<p className="text-gray-700 leading-relaxed">
								Our services are not directed to children under the age of 13.
								We do not knowingly collect personal information from children
								under 13. If we become aware that we have collected personal
								information from a child under 13, we will take steps to delete
								such information promptly.
							</p>
						</section>

						<Separator />

						{/* International Transfers */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								International Data Transfers
							</h2>
							<p className="text-gray-700 leading-relaxed">
								Your information may be transferred to and processed in
								countries other than your country of residence. We ensure that
								such transfers are conducted in accordance with applicable data
								protection laws and with appropriate safeguards in place.
							</p>
						</section>

						<Separator />

						{/* Changes to Privacy Policy */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">
								Changes to This Privacy Policy
							</h2>
							<p className="text-gray-700 leading-relaxed">
								We may update this privacy policy from time to time to reflect
								changes in our practices or applicable law. We will notify you
								of any material changes by posting the updated policy on our
								website and updating the “Last updated” date. Your continued use
								of our services after such changes constitutes acceptance of the
								updated policy.
							</p>
						</section>

						<Separator />

						{/* Contact Information */}
						<section className="my-4">
							<h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
							<p className="text-gray-700 leading-relaxed mb-4">
								If you have any questions, concerns, or requests regarding this
								privacy policy or our data practices, please contact us:
							</p>

							<div className="bg-gray-50 p-6 rounded-lg">
								<h3 className="text-lg font-medium text-gray-800 mb-3">
									Travel Habarana
								</h3>
								<div className="space-y-2 text-gray-700">
									<p>Email: fernandoprashan2003@icloud.com</p>
									<p>Phone: +94 76 667 5883</p>
									<p>Address: Habarana, Sri Lanka</p>
								</div>
							</div>

							<p className="text-gray-700 leading-relaxed mt-4">
								We are committed to resolving any privacy-related concerns
								promptly and transparently.
							</p>
						</section>
					</CardContent>
				</Card>

				{/* Navigation */}
				<div className="mt-8 text-center">
					<Link href="/">
						<Button variant={"link"}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
