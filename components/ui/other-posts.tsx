import { GET_OTHERS_POSTS_QUERYResult, Post } from "@/sanity/types";
import { BlogCard } from "./blog-card";

export default async function OtherPosts({
	otherPosts,
}: {
	otherPosts: GET_OTHERS_POSTS_QUERYResult;
}) {
	return (
		<div className="container mx-auto px-4">
			<p className="text-xl font-semibold mb-5">You may also like</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
				{otherPosts?.map((post) => (
					<BlogCard key={post.slug?.current} post={post as unknown as Post} />
				))}
			</div>
		</div>
	);
}
