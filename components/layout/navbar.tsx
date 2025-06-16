"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PaperPlaneTilt, List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const navLinks = [
	{
		href: "/",
		label: "Home",
		isActiveFunc: (pathname: string) => pathname === "/",
	},
	{
		href: "/packages",
		label: "Packages",
		isActiveFunc: (pathname: string) => pathname.startsWith("/packages"),
	},
	{
		href: "/book-now",
		label: "Book Now",
		isActiveFunc: (pathname: string) => pathname === "/book-now",
	},
	{
		href: "/blogs",
		label: "Blogs",
		isActiveFunc: (pathname: string) => pathname.startsWith("/blogs"),
	},
	{
		href: "/contact",
		label: "Contact",
		isActiveFunc: (pathname: string) => pathname === "/contact",
	},
];

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
						<Image
							src={
								isHomePage && !isScrolled
									? siteConfig.logoDark
									: siteConfig.logo
							}
							alt={`${siteConfig.name} Logo`}
							width={25}
							height={25}
							className="mr-1"
						/>
						<span className="text-xl font-bold font-serif">
							{siteConfig.name}
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center space-x-10">
						{navLinks.map((link) => (
							<NavLink
								key={link.href}
								href={link.href}
								label={link.label}
								isActive={link.isActiveFunc(pathname)}
								isHomePage={isHomePage}
								isScrolled={isScrolled}
							/>
						))}

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
						className="lg:hidden text-2xl focus:outline-none"
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
					className="lg:hidden bg-white"
				>
					<div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
						{navLinks.map((link) => (
							<MobileNavLink
								key={link.href}
								href={link.href}
								label={link.label}
								onClick={() => setIsMobileMenuOpen(false)}
							/>
						))}

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
