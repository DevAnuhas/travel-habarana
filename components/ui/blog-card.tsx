"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CalendarDots } from "@phosphor-icons/react/dist/ssr";
import { urlFor } from "@/sanity/lib/image";
import type { Post } from "@/sanity/types";

interface BlogCardProps {
	post: Post;
	index?: number; // Add optional index for staggered animations
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<motion.article
			className="bg-white rounded-xl overflow-hidden shadow-lg h-full flex flex-col group"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.5,
				delay: index * 0.2,
			}}
			viewport={{ once: true, margin: "-50px" }}
		>
			<Link
				href={`/blogs/${post.slug?.current ? post.slug.current : post.slug}`}
				className="flex flex-col h-full"
			>
				<div className="relative aspect-[16/9] overflow-hidden h-auto w-full">
					{post?.mainImage && (
						<Image
							src={urlFor(post?.mainImage).url()}
							className=" object-cover group-hover:scale-105 transition-transform duration-300"
							alt={post.mainImage?.alt || "Blog Post Image"}
							fill
							priority={index < 3} // Prioritize loading first 3 images
						/>
					)}
					{post.isFeatured && (
						<div className="absolute top-4 left-4">
							<Badge className="bg-primary hover:bg-primary">Featured</Badge>
						</div>
					)}
				</div>

				<div className="p-6 flex-1 flex flex-col">
					<h3
						className={`font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors ${
							post.isFeatured ? "text-xl md:text-2xl" : "text-lg"
						}`}
					>
						{post.title}
					</h3>

					<p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
						{post.excerpt}
					</p>

					<div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
						<div className="flex items-center space-x-4">
							<div className="flex items-center">
								<CalendarDots className="mr-2 h-4 w-4" />
								<span>{formatDate(post.publishedAt || "")}</span>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</motion.article>
	);
}
