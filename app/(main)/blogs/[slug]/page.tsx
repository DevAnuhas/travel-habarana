import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDots } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/ui/blog-card";
import { getAllPosts, getOtherPosts, getPost } from "@/sanity/queries";
import { PortableText } from "next-sanity";
import { ALL_POSTS_QUERYResult, Post } from "@/sanity/types";
import { urlFor } from "@/sanity/lib/image";
import { Metadata } from "next/types";
import { siteConfig } from "@/config/site";

interface BlogPostPageProps {
	params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = (await getPost(slug)) || notFound();
	const otherPosts = await getOtherPosts(slug, 3);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="min-h-screen py-20 bg-white">
			{/* Article Content */}
			<article className="container mx-auto px-4 py-12">
				<div className="max-w-2xl mx-auto">
					{/* Article Header */}
					<header className="mb-8">
						<div className="flex flex-wrap gap-2 mb-4">
							{post.categories?.map((category) => (
								<Link
									key={category.slug}
									href={`/blogs?category=${category.slug}`}
								>
									<Badge
										variant="outline"
										className="hover:bg-primary hover:text-white transition-colors"
									>
										{category.title}
									</Badge>
								</Link>
							))}
						</div>

						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
							{post.title}
						</h1>

						<div className="flex items-center space-x-2 text-gray-600 mb-6">
							<CalendarDots className="h-4 w-4" />
							<span>{formatDate(post.publishedAt || "")}</span>
						</div>

						{/* Hero Image */}
						<div className="relative aspect-[16/9] overflow-hidden h-auto w-full">
							{post?.mainImage && (
								<Image
									src={urlFor(post?.mainImage).url()}
									fill
									className="object-cover rounded-lg"
									alt="postMainImage"
								/>
							)}
							<div className="inset-0 bg-black bg-opacity-20 z-100" />
						</div>
					</header>

					{/* Article Body */}
					<div className="prose prose-lg max-w-none">
						{post?.body && (
							<PortableText
								value={post?.body}
								components={{
									block: {
										normal: ({ children }) => (
											<p className="mb-4 leading-relaxed first:mt-0 last:mb-0">
												{children}
											</p>
										),
										h2: ({ children }) => (
											<h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8 first:mt-0 last:mb-0">
												{children}
											</h2>
										),
										h3: ({ children }) => (
											<h3 className="text-xl font-bold text-gray-900 mb-3 mt-6 first:mt-0 last:mb-0">
												{children}
											</h3>
										),
										blockquote: ({ children }) => (
											<blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-6 first:mt-0 last:mb-0">
												{children}
											</blockquote>
										),
									},
									types: {
										image: ({ value }) => (
											<Image
												alt={value.alt || ""}
												src={urlFor(value).url()}
												width={800}
												height={400}
												className="rounded-lg shadow-md w-full"
											/>
										),
										separator: ({ value }) => {
											switch (value.style) {
												case "line":
													return (
														<hr className="my-8 border-t border-gray-200" />
													);
												case "space":
													return <div className="my-8" />;
												default:
													return null;
											}
										},
									},
									list: {
										bullet: ({ children }) => (
											<ul className="list-disc pl-4 text-base/8 marker:text-gray-400">
												{children}
											</ul>
										),
										number: ({ children }) => (
											<ol className="list-decimal pl-4 text-base/8 marker:text-gray-400">
												{children}
											</ol>
										),
									},
									listItem: {
										bullet: ({ children }) => {
											return (
												<li className="my-2 pl-2 has-[br]:mb-8">{children}</li>
											);
										},
										number: ({ children }) => {
											return (
												<li className="my-2 pl-2 has-[br]:mb-8">{children}</li>
											);
										},
									},
									marks: {
										strong: ({ children }) => (
											<strong className="font-semibold text-gray-950">
												{children}
											</strong>
										),
										code: ({ children }) => (
											<>
												<span aria-hidden>`</span>
												<code className="text-[15px]/8 font-semibold text-gray-950">
													{children}
												</code>
												<span aria-hidden>`</span>
											</>
										),
										link: ({ value, children }) => {
											return (
												<Link
													href={value.href}
													className="font-medium text-gray-950 underline decoration-gray-400 underline-offset-4 data-[hover]:decoration-gray-600"
												>
													{children}
												</Link>
											);
										},
									},
								}}
							/>
						)}
					</div>
				</div>
			</article>

			{/* Related Posts */}
			{otherPosts.length > 0 && (
				<section className="bg-gray-50 py-16">
					<div className="container mx-auto px-4">
						<h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
							Related Articles
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
							{otherPosts.map((relatedPost) => (
								<BlogCard
									key={relatedPost?.slug?.current}
									post={relatedPost as unknown as Post}
								/>
							))}
						</div>
					</div>
				</section>
			)}
		</div>
	);
}

// Generate static params for all blog posts
export async function generateStaticParams() {
	const posts: ALL_POSTS_QUERYResult = await getAllPosts(8);

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

// Generate metadata for SEO
export async function generateMetadata({
	params,
}: BlogPostPageProps): Promise<Metadata> {
	const { slug } = await params;

	try {
		const post = await getPost(slug);

		if (!post) {
			return {
				title: "Post Not Found",
			};
		}

		return {
			title: `${post.title} | Travel Habarana Blog`,
			description: post.excerpt,
			openGraph: {
				title: post.title || "Travel Habarana Blog Post",
				description:
					post.excerpt || "Read our latest blog post on Travel Habarana.",
				images: [
					{
						url: post?.mainImage
							? urlFor(post.mainImage).url()
							: siteConfig.ogImage,
						width: 800,
						height: 600,
						alt: `${post.mainImage}`,
					},
				],
			},
		};
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "Travel Habarana Blog",
			description: "Read our latest blog posts on Travel Habarana.",
			openGraph: {
				title: "Travel Habarana Blog",
				description: "Read our latest blog posts on Travel Habarana.",
				images: [
					{
						url: siteConfig.ogImage,
						width: 800,
						height: 600,
						alt: "Travel Habarana Blog",
					},
				],
			},
		};
	}
}
