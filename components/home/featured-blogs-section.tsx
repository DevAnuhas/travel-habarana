import Link from "next/link";
import SectionHeading from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/ui/blog-card";
import { getFeaturedPosts } from "@/sanity/queries";
import { Post, ALL_POSTS_QUERYResult } from "@/sanity/types";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export default async function FeaturedBlogsSection() {
	const featuredPosts: ALL_POSTS_QUERYResult = await getFeaturedPosts(3);

	return (
		<section className="py-20 px-4 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<SectionHeading
						title="Latest Travel Stories"
						subtitle="Discover amazing adventures, cultural insights, and travel tips from our expert guides"
					/>
				</div>

				{/* Fix: Text are not aligned center */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					{featuredPosts?.length === 0 ? (
						<div className="col-span-3 text-center py-12">
							<p className="text-muted-foreground">
								No featured posts available at the moment. Please check back
								later.
							</p>
						</div>
					) : (
						featuredPosts.map((post) => (
							<BlogCard key={post?.slug} post={post as unknown as Post} />
						))
					)}
				</div>
				<div className="text-center">
					<Link href="/blogs" className="group">
						<Button size={"lg"}>
							View All Blog Posts
							<ArrowRight
								size={16}
								className="ml-1 group-hover:translate-x-1 transition-all"
							/>
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
