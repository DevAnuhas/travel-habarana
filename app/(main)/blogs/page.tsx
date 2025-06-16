"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/ui/blog-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { getAllPosts, getCategories, getCategoryPost } from "@/sanity/queries";
import {
	Post,
	Category,
	ALL_POSTS_QUERYResult,
	CATEGORIES_QUERYResult,
	CATEGORY_POSTResult,
} from "@/sanity/types";
import LoadingSpinner from "@/components/ui/spinner";

// Helper function to get slug value consistently
const getSlugValue = (
	slug: string | { current?: string } | undefined
): string => {
	if (!slug) return "";
	return typeof slug === "string" ? slug : slug.current || "";
};

export default function BlogPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	// Get category from URL query parameter or default to "all"
	const categoryParam = searchParams.get("category");
	const searchParam = searchParams.get("search");

	const [selectedCategory, setSelectedCategory] = useState<string>(
		categoryParam || "all"
	);
	const [searchQuery, setSearchQuery] = useState(searchParam || "");
	const [allPosts, setAllPosts] = useState<Post[]>([]);
	const [categoryPosts, setCategoryPosts] = useState<Post[]>([]);
	const [blogCategories, setBlogCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingCategory, setIsLoadingCategory] = useState(false);

	// Update URL when category changes
	const updateCategoryInURL = useCallback(
		(category: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (category === "all") {
				params.delete("category");
			} else {
				params.set("category", category);
			}

			// Use replace to avoid growing browser history for filter changes
			const newUrl = params.toString()
				? `${pathname}?${params.toString()}`
				: pathname;
			router.replace(newUrl, { scroll: false });
		},
		[searchParams, pathname, router]
	);

	// Function to handle category selection
	const handleCategorySelect = (category: string) => {
		setIsLoadingCategory(true);
		setSelectedCategory(category);
		updateCategoryInURL(category);
	};

	// Update URL when search query changes
	const updateSearchInURL = useCallback(
		(search: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (!search) {
				params.delete("search");
			} else {
				params.set("search", search);
			}

			// Use replace to avoid growing browser history for each keystroke
			const newUrl = params.toString()
				? `${pathname}?${params.toString()}`
				: pathname;
			router.replace(newUrl, { scroll: false });
		},
		[searchParams, pathname, router]
	);

	// Store timeout reference
	const searchDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

	// Completely separate typing from URL updates
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSearchQuery = e.target.value;

		// Just update local state immediately
		setSearchQuery(newSearchQuery);

		// Clear any existing timeout
		if (searchDebounceRef.current) {
			clearTimeout(searchDebounceRef.current);
		}
	};

	// Separate URL update button instead of automatic update while typing
	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // Prevent form submission default behavior
		updateSearchInURL(searchQuery); // Only update URL when explicitly submitted
	};

	// Fetch all posts and categories on initial load
	useEffect(() => {
		const fetchData = async () => {
			try {
				const fetchedPosts: ALL_POSTS_QUERYResult = await getAllPosts(8);
				const fetchedCategories: CATEGORIES_QUERYResult = await getCategories();

				setAllPosts(
					fetchedPosts.map((post) => ({
						...(post as unknown as Post),
					}))
				);

				setBlogCategories(
					fetchedCategories.map((category) => ({
						...(category as unknown as Category),
					}))
				);

				// If there's a category param in the URL, validate it against fetched categories
				if (categoryParam && categoryParam !== "all") {
					const isValidCategory = fetchedCategories.some(
						(category) =>
							getSlugValue(category.slug?.toString()) === categoryParam
					);

					if (!isValidCategory) {
						// If category doesn't exist, reset to "all" and update URL
						setSelectedCategory("all");
						updateCategoryInURL("all");
					}
				}

				// Initialize search from URL if present but don't update query params
				if (searchParam) {
					setSearchQuery(searchParam);
				}

				console.log("Fetched categories:", fetchedCategories);
			} catch (error) {
				console.error("Failed to fetch blog data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [categoryParam, searchParam, updateCategoryInURL]);

	// Fetch category posts when selectedCategory changes
	useEffect(() => {
		if (selectedCategory === "all") {
			setCategoryPosts([]);
			return;
		}

		const fetchCategoryPosts = async () => {
			setIsLoadingCategory(true);
			try {
				const fetchedPosts: CATEGORY_POSTResult =
					await getCategoryPost(selectedCategory);

				setCategoryPosts(
					fetchedPosts.map((post) => ({
						...(post as unknown as Post),
					}))
				);
			} catch (error) {
				console.error(
					`Failed to fetch posts for category ${selectedCategory}:`,
					error
				);
				// Reset to prevent showing stale data
				setCategoryPosts([]);
			} finally {
				setIsLoadingCategory(false);
			}
		};

		fetchCategoryPosts();
	}, [selectedCategory]);

	const filteredPosts = useMemo(() => {
		// Use either all posts or category posts based on selection
		let posts: Post[] = selectedCategory === "all" ? allPosts : categoryPosts;

		// Apply search filter if there's a query
		if (searchQuery) {
			const searchTermLower = searchQuery.toLowerCase();
			posts = posts.filter(
				(post) =>
					(post.title || "").toLowerCase().includes(searchTermLower) ||
					(post.excerpt || "").toLowerCase().includes(searchTermLower)
			);
		}

		return posts;
	}, [selectedCategory, searchQuery, allPosts, categoryPosts]);

	return (
		<main className="pt-20 bg-gray-50">
			{/* Hero Section */}
			<section className="bg-primary text-white py-16 md:py-16">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
						Travel Blog
					</h1>
					<p className="text-lg md:text-xl max-w-2xl mx-auto mb-6">
						Discover amazing stories, travel tips, and cultural insights from
						the heart of Sri Lanka
					</p>
					{/* Search Bar */}
					<form
						onSubmit={handleSearchSubmit}
						className="relative max-w-md mx-auto"
					>
						<MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<Input
							type="text"
							placeholder="Search blog posts..."
							value={searchQuery}
							onChange={handleSearchChange}
							className="pl-10 pr-16 bg-white text-gray-900"
							disabled={isLoading}
							autoComplete="off"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									updateSearchInURL(searchQuery);
								}
							}}
						/>
						<Button
							type="submit"
							size="sm"
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
							disabled={isLoading}
							variant="ghost"
						>
							Search
						</Button>
					</form>
				</div>
			</section>

			<div className="container mx-auto px-4 py-12">
				{/* Category Filter */}
				<div className="mb-8">
					<h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
					<div className="flex flex-wrap gap-2">
						<Badge
							variant={selectedCategory === "all" ? "default" : "outline"}
							className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
							onClick={() => handleCategorySelect("all")}
						>
							All Posts
						</Badge>
						{blogCategories?.map((category) => (
							<Badge
								key={getSlugValue(category.slug)}
								variant={
									selectedCategory === getSlugValue(category.slug)
										? "default"
										: "outline"
								}
								className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
								onClick={() => {
									handleCategorySelect(getSlugValue(category.slug));
								}}
							>
								{category.title}
							</Badge>
						))}
					</div>
				</div>

				{/* Results Count */}
				<div className="mb-6">
					<p className="text-gray-600">
						{isLoading || (selectedCategory !== "all" && isLoadingCategory) ? (
							"Loading..."
						) : searchQuery ? (
							<>
								Showing {filteredPosts.length} results for &quot;{searchQuery}
								&quot;
							</>
						) : (
							<>
								Showing {filteredPosts.length} posts{" "}
								{selectedCategory !== "all" &&
									`in ${blogCategories.find((c) => getSlugValue(c.slug) === selectedCategory)?.title}`}
							</>
						)}
					</p>
				</div>

				{/* Blog Posts Grid */}
				{isLoading || (selectedCategory !== "all" && isLoadingCategory) ? (
					<div className="flex justify-center items-center h-64">
						<LoadingSpinner />
					</div>
				) : filteredPosts.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filteredPosts.map((post) => (
							<BlogCard
								key={getSlugValue(post.slug)}
								post={post as unknown as Post}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg mb-4">
							No blog posts found matching your criteria.
						</p>{" "}
						<Button
							onClick={() => {
								// Reset loading state to show feedback
								setIsLoading(true);

								// Clear any existing debounce timeout
								if (searchDebounceRef.current) {
									clearTimeout(searchDebounceRef.current);
									searchDebounceRef.current = null;
								}

								// Clear category and search states
								setSelectedCategory("all");
								setSearchQuery("");

								// Directly clear URL without any parameters
								router.replace(pathname);

								// Give a small delay for UI feedback
								setTimeout(() => setIsLoading(false), 300);
							}}
							variant={"link"}
						>
							Clear filters
						</Button>
					</div>
				)}
			</div>
		</main>
	);
}
