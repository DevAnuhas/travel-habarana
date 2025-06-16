"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/ui/blog-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import {
	getAllPosts,
	getCategories,
	getCategoryPost,
	getPostsCount,
	getCategoryPostCount,
} from "@/sanity/queries";
import {
	Post,
	Category,
	ALL_POSTS_QUERYResult,
	CATEGORIES_QUERYResult,
	CATEGORY_POSTResult,
} from "@/sanity/types";
import LoadingSpinner from "@/components/ui/spinner";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

// Helper function to get slug value consistently
const getSlugValue = (
	slug: string | { current?: string } | undefined
): string => {
	if (!slug) return "";
	return typeof slug === "string" ? slug : slug.current || "";
};

// Constants for pagination
const POSTS_PER_PAGE = 9;

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

	// New state for infinite scrolling
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [totalPosts, setTotalPosts] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);

	// Intersection observer for infinite scrolling
	const { ref, isIntersecting } = useIntersectionObserver({
		threshold: 0.1,
		rootMargin: "200px",
		enabled: !isLoading && !loadingMore && hasMore,
	});

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
		setPage(1); // Reset to page 1 when changing categories
		setAllPosts([]); // Clear existing posts
		setCategoryPosts([]); // Clear existing category posts
		setHasMore(true); // Reset hasMore state
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
		setPage(1); // Reset to page 1 when searching
		setAllPosts([]); // Clear existing posts
		setCategoryPosts([]); // Clear existing category posts
		setHasMore(true); // Reset hasMore state
		updateSearchInURL(searchQuery); // Only update URL when explicitly submitted
	};

	// Fetch categories on initial load
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const fetchedCategories: CATEGORIES_QUERYResult = await getCategories();

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
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};

		fetchCategories();
	}, [categoryParam, searchParam, updateCategoryInURL]);

	// Fetch total post count
	useEffect(() => {
		const fetchTotalPosts = async () => {
			try {
				if (selectedCategory === "all") {
					const count = await getPostsCount();
					setTotalPosts(count);
				} else {
					const count = await getCategoryPostCount(selectedCategory);
					setTotalPosts(count);
				}
			} catch (error) {
				console.error("Failed to fetch post counts:", error);
				setTotalPosts(0);
			}
		};

		fetchTotalPosts();
	}, [selectedCategory]);

	// Load initial posts
	useEffect(() => {
		const fetchInitialPosts = async () => {
			setIsLoading(true);
			try {
				const start = 0;
				const end = POSTS_PER_PAGE - 1;

				if (selectedCategory === "all") {
					const fetchedPosts: ALL_POSTS_QUERYResult = await getAllPosts(
						start,
						end
					);
					setAllPosts(
						fetchedPosts.map((post) => ({
							...(post as unknown as Post),
						}))
					);
				} else {
					const fetchedPosts: CATEGORY_POSTResult = await getCategoryPost(
						selectedCategory,
						start,
						end
					);
					setCategoryPosts(
						fetchedPosts.map((post) => ({
							...(post as unknown as Post),
						}))
					);
				}

				// Update hasMore based on whether we've loaded all posts
				const currentLoadedCount = POSTS_PER_PAGE;
				setHasMore(currentLoadedCount < totalPosts);
			} catch (error) {
				console.error("Failed to fetch blog data:", error);
				if (selectedCategory === "all") {
					setAllPosts([]);
				} else {
					setCategoryPosts([]);
				}
			} finally {
				setIsLoading(false);
				setIsLoadingCategory(false);
			}
		};

		fetchInitialPosts();
	}, [selectedCategory, searchParam, totalPosts]);

	// Effect for loading more posts when intersection observed
	useEffect(() => {
		const loadMorePosts = async () => {
			if (!isIntersecting || loadingMore || !hasMore) return;

			setLoadingMore(true);
			try {
				const start = page * POSTS_PER_PAGE;
				const end = start + POSTS_PER_PAGE - 1;

				if (selectedCategory === "all") {
					const morePosts: ALL_POSTS_QUERYResult = await getAllPosts(
						start,
						end
					);

					if (morePosts.length) {
						setAllPosts((prev) => [
							...prev,
							...morePosts.map((post) => ({ ...(post as unknown as Post) })),
						]);
						setPage((prev) => prev + 1);
					}

					// Check if we've loaded all posts
					setHasMore(start + morePosts.length < totalPosts);
				} else {
					const morePosts: CATEGORY_POSTResult = await getCategoryPost(
						selectedCategory,
						start,
						end
					);

					if (morePosts.length) {
						setCategoryPosts((prev) => [
							...prev,
							...morePosts.map((post) => ({ ...(post as unknown as Post) })),
						]);
						setPage((prev) => prev + 1);
					}

					// Check if we've loaded all posts
					setHasMore(start + morePosts.length < totalPosts);
				}
			} catch (error) {
				console.error("Failed to load more posts:", error);
			} finally {
				setLoadingMore(false);
			}
		};

		loadMorePosts();
	}, [
		isIntersecting,
		loadingMore,
		hasMore,
		page,
		selectedCategory,
		totalPosts,
	]);

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
		<main className="py-20 bg-gray-50">
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
									setPage(1); // Reset page when searching
									setAllPosts([]); // Clear existing posts
									setCategoryPosts([]); // Clear existing category posts
									setHasMore(true); // Reset hasMore state
									updateSearchInURL(searchQuery);
								}
							}}
						/>
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
								{totalPosts > filteredPosts.length && hasMore
									? ` (Scroll for more)`
									: ``}
							</>
						) : (
							<>
								Showing {filteredPosts.length} posts{" "}
								{totalPosts > filteredPosts.length && hasMore
									? ` of ${totalPosts} `
									: ` `}
								{selectedCategory !== "all" &&
									`in ${blogCategories.find((c) => getSlugValue(c.slug) === selectedCategory)?.title}`}
							</>
						)}
					</p>
				</div>

				{/* Blog Posts Grid */}
				{isLoading && (
					<div className="flex justify-center items-center h-64">
						<LoadingSpinner />
					</div>
				)}

				{!isLoading && filteredPosts.length > 0 && (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredPosts.map((post, index) => (
								<BlogCard
									key={getSlugValue(post.slug) + "-" + post._updatedAt}
									post={post as unknown as Post}
									index={index}
								/>
							))}
						</div>

						{/* Loading indicator for infinite scroll */}
						{hasMore && (
							<div
								ref={ref}
								className="flex justify-center items-center py-8 mt-8"
							>
								{loadingMore ? (
									<LoadingSpinner />
								) : (
									<p className="text-gray-500">Scroll for more</p>
								)}
							</div>
						)}
					</>
				)}

				{!isLoading && filteredPosts.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg mb-4">
							No blog posts found matching your criteria.
						</p>
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
								setPage(1);
								setHasMore(true);
								setAllPosts([]);
								setCategoryPosts([]);

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
