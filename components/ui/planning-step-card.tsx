import { motion } from "framer-motion";

export default function PlanningStepCard({
	number,
	title,
	description,
	tip,
}: {
	number: number;
	title: string;
	description: string;
	tip: string;
}) {
	return (
		<motion.div
			className="relative bg-white/20 backdrop-blur-md rounded-xl overflow-hidden"
			initial={{
				opacity: 0,
				y: 20,
				boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.3)",
			}}
			whileInView={{ opacity: 1, y: 0 }}
			whileHover={{
				scale: 1.03,
				boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
			}}
			transition={{
				duration: 0.2,
			}}
			viewport={{ once: true }}
		>
			{/* Step number indicator */}
			<div className="absolute top-0 left-0 w-12 h-12 bg-primary text-white flex items-center justify-center text-xl font-bold font-serif rounded-br-xl z-10">
				{number}
			</div>

			<div className="pt-14 pb-6 px-6">
				<h3 className="text-xl font-bold mb-4">{title}</h3>
				<p className="text-gray-600 mb-4">{description}</p>
				<div className="relative bg-primary/10 p-4 rounded-lg">
					<p className="text-sm text-muted-foreground">{tip}</p>
				</div>
			</div>
		</motion.div>
	);
}
