import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex-grow">
			<Navbar />
			{children}
			<Footer />
		</div>
	);
}
