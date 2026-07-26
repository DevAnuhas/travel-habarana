interface SectionHeadingProps {
	title: string;
	subtitle?: string;
	alignment?: "left" | "center";
}

export default function SectionHeading({
	title,
	subtitle,
	alignment = "center",
}: SectionHeadingProps) {
	const alignmentClasses = {
		left: "text-left",
		center: "text-center mx-auto",
	};

	return (
		<div
			className={`max-w-2xl flex flex-col items-center justify-center mb-12 ${alignmentClasses[alignment]}`}
		>
			<h2
				className="text-3xl text-primary md:text-4xl font-bold mb-4"
			>
				{title}
			</h2>

			{subtitle && (
				<p className="text-gray-600 max-w-xl">
					{subtitle}
				</p>
			)}

			<div
				className="w-24 h-1 bg-primary mt-6"
				style={{
					marginLeft: alignment === "center" ? "auto" : 0,
					marginRight: alignment === "center" ? "auto" : 0,
				}}
			/>
		</div>
	);
}
