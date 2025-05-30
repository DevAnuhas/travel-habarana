"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PaperPlaneTilt, List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function Navbar() {
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isHomePage = pathname === "/";

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Determine navbar background style
	const navbarBgClass = isHomePage
		? isScrolled
			? "bg-white/80 backdrop-blur-md shadow-sm text-gray-800"
			: "bg-transparent text-white"
		: "bg-white/80 backdrop-blur-md shadow-sm text-gray-800";

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBgClass}`}
		>
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<Link href="/" className="flex items-center">
						<span className="text-xl font-bold font-serif">
							{siteConfig.name}
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						<NavLink
							href="/"
							label="Home"
							isActive={pathname === "/"}
							isHomePage={isHomePage}
							isScrolled={isScrolled}
						/>
						<NavLink
							href="/packages"
							label="Packages"
							isActive={pathname.startsWith("/packages")}
							isHomePage={isHomePage}
							isScrolled={isScrolled}
						/>
						<NavLink
							href="/book-now"
							label="Book Now"
							isActive={pathname === "/book-now"}
							isHomePage={isHomePage}
							isScrolled={isScrolled}
						/>
						<NavLink
							href="/contact"
							label="Contact"
							isActive={pathname === "/contact"}
							isHomePage={isHomePage}
							isScrolled={isScrolled}
						/>

						<Button
							asChild
							className={`ml-4 ${
								isHomePage && !isScrolled
									? "bg-white text-primary hover:bg-gray-100"
									: "bg-primary hover:bg-primary text-white"
							}`}
						>
							<Link href="/book-now" className="group">
								Send Inquiry
								<PaperPlaneTilt className="group-hover:rotate-45 transition-all" />
							</Link>
						</Button>
					</nav>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden text-2xl focus:outline-none"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{isMobileMenuOpen ? (
							<X className="text-current" />
						) : (
							<List className="text-current" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Navigation */}
			{isMobileMenuOpen && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="md:hidden bg-white"
				>
					<div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
						<MobileNavLink
							href="/"
							label="Home"
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						<MobileNavLink
							href="/packages"
							label="Packages"
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						<MobileNavLink
							href="/book-now"
							label="Book Now"
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						<MobileNavLink
							href="/contact"
							label="Contact"
							onClick={() => setIsMobileMenuOpen(false)}
						/>

						<Button asChild className="w-full bg-primary hover:bg-primary">
							<Link href="/book-now" onClick={() => setIsMobileMenuOpen(false)}>
								Send Inquiry
								<PaperPlaneTilt className="group-hover:translate-x-1 transition-all" />
							</Link>
						</Button>
					</div>
				</motion.div>
			)}
		</header>
	);
}

// Desktop Navigation Link
function NavLink({
	href,
	label,
	isActive,
	isHomePage,
	isScrolled,
}: {
	href: string;
	label: string;
	isActive: boolean;
	isHomePage: boolean;
	isScrolled: boolean;
}) {
	const textColor = isHomePage && !isScrolled ? "text-white" : "text-gray-800";

	return (
		<Link
			href={href}
			className={`relative font-medium transition-colors hover:text-primary ${textColor}`}
		>
			{label}
			{isActive && (
				<span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform translate-y-1"></span>
			)}
		</Link>
	);
}

// Mobile Navigation Link
function MobileNavLink({
	href,
	label,
	onClick,
}: {
	href: string;
	label: string;
	onClick: () => void;
}) {
	const pathname = usePathname();
	const isActive =
		pathname === href || (href !== "/" && pathname.startsWith(href));

	return (
		<Link
			href={href}
			className={`block py-2 font-medium ${
				isActive ? "text-primary" : "text-gray-800"
			} hover:text-primary`}
			onClick={onClick}
		>
			{label}
		</Link>
	);
}
