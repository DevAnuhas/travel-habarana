import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

function CTABannerSection() {
	return (
		<section className="relative py-20">
			<div className="absolute flex inset-0 bg-gray-900">
				<Image
					src="https://res.cloudinary.com/travelhabarana/image/upload/v1747225657/2_i0j9uk.png"
					alt="Sri Lankan landscape"
					fill
					className="object-cover object-center opacity-30"
				/>
			</div>

			<div className="relative container mx-auto px-4 text-center text-white">
				<h2
					className="text-3xl md:text-4xl font-bold mb-4"
				>
					Ready to Experience Sri Lanka with Us?
				</h2>

				<p
					className="text-white max-w-xl mx-auto mb-8"
				>
					Book your safari tour or cultural experience today and create
					unforgettable memories in the beautiful island of Sri Lanka.
				</p>

				<div>
					<Link href="/book-now" className="group">
						<Button size="lg" variant={"secondary"}>
							Book Your Safari
							<ArrowRight className="ml-1 group-hover:translate-x-1 transition-all" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}

export default CTABannerSection;
