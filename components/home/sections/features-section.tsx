import { Shield, Users, MapPin } from "@phosphor-icons/react";
import FeatureCard from "@/components/ui/feature-card";
import SectionHeading from "@/components/ui/section-heading";

function FeaturesSection() {
	return (
		<section className="py-20 px-4 bg-gray-50">
			<div className="container mx-auto">
				<SectionHeading
					title="Why Travel Habarana?"
					subtitle="We pride ourselves on providing safe, authentic, and unforgettable experiences for our guests"
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<FeatureCard
						icon={<Shield size={40} />}
						title="Luxury & Safety"
						description="Our fleet of modern jeeps are equipped with seatbelts, first aid kits, and comprehensive insurance for your peace of mind."
						delay={0.1}
					/>
					<FeatureCard
						icon={<MapPin size={40} />}
						title="Authentic Experiences"
						description="From traditional Oruwa boat rides to home-cooked 9-curry lunches, we offer genuine cultural immersion."
						delay={0.2}
					/>
					<FeatureCard
						icon={<Users size={40} />}
						title="Expert Guides"
						description="Our knowledgeable local guides speak fluent English and have years of experience spotting wildlife and sharing cultural insights."
						delay={0.3}
					/>
				</div>
			</div>
		</section>
	);
}

export default FeaturesSection;
