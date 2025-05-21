import Link from "next/link";
import {
	FacebookLogo,
	InstagramLogo,
	TiktokLogo,
	WhatsappLogo,
	EnvelopeOpen,
	MapPinLine,
	Phone,
} from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
	return (
		<footer className="bg-gray-900 text-secondary">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Company Info */}
					<div>
						<h3 className="text-xl font-bold mb-4">Travel Habarana</h3>
						<p className="mb-4 text-gray-300">
							Discover the beauty of Sri Lanka&apos;s wildlife and culture with
							our expert-guided safari and village tours.
						</p>
						<div className="flex space-x-4">
							<a
								href="https://facebook.com/people/Jeep-safari-habarana/61557160063166/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-300 hover:text-secondary transition-colors"
								aria-label="Facebook"
							>
								<FacebookLogo size={20} />
							</a>
							<a
								href="https://www.instagram.com/travel_in_habarana"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-300 hover:text-secondary transition-colors"
								aria-label="Instagram"
							>
								<InstagramLogo size={20} />
							</a>
							<a
								href="https://www.tiktok.com/@travel.in.habaran"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-300 hover:text-secondary transition-colors"
								aria-label="Instagram"
							>
								<TiktokLogo size={20} />
							</a>
							<a
								href="https://wa.me/+94766675883"
								className="text-gray-300 hover:text-secondary transition-colors"
								aria-label="WhatsApp"
							>
								<WhatsappLogo size={20} />
							</a>
							<a
								href="mailto:fernandoprashan2003@icloud.com"
								className="text-gray-300 hover:text-secondary transition-colors"
								aria-label="Email"
							>
								<EnvelopeOpen size={20} />
							</a>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-xl font-bold mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/"
									className="text-gray-300 hover:text-secondary transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/packages"
									className="text-gray-300 hover:text-secondary transition-colors"
								>
									Safari Packages
								</Link>
							</li>
							<li>
								<Link
									href="/book-now"
									className="text-gray-300 hover:text-secondary transition-colors"
								>
									Book Now
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-gray-300 hover:text-secondary transition-colors"
								>
									Contact Us
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h3 className="text-xl font-bold mb-4">Contact Us</h3>
						<div className="space-y-3">
							<div className="flex items-start">
								<Phone size={18} className="mr-2 mt-1 flex-shrink-0" />
								<span className="text-gray-300">+94 76 667 5883</span>
							</div>
							<div className="flex items-start">
								<EnvelopeOpen size={18} className="mr-2 mt-1 flex-shrink-0" />
								<span className="text-gray-300">
									fernandoprashan2003@icloud.com
								</span>
							</div>
							<div className="flex items-start">
								<MapPinLine size={18} className="mr-2 mt-1 flex-shrink-0" />
								<span className="text-gray-300">Habarana, Sri Lanka</span>
							</div>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
					<p>
						&copy; {new Date().getFullYear()} Travel Habarana. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
