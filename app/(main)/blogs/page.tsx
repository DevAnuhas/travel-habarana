import { Suspense } from "react"
import { MobileContactBar } from "@/components/common/mobile-contact-bar"
import Link from "next/link"
import type { Metadata } from "next"
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr"

import { BlogCard } from "@/components/ui/blog-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getBlogIndex, getCategories } from "@/sanity/queries"
import type { Post } from "@/sanity/types"
import { siteConfig } from "@/config/site"

const POSTS_PER_PAGE = 9

type BlogSearchParams = Promise<{
  category?: string | string[]
  search?: string | string[]
  page?: string | string[]
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: BlogSearchParams
}): Promise<Metadata> {
  const params = await searchParams
  const hasFilteredView = Boolean(
    readParam(params.category) ||
    readParam(params.search) ||
    Number.parseInt(readParam(params.page) || "1", 10) > 1
  )

  return {
    title: "Safari Guides & Habarana Travel Blog",
    description:
      "Local advice for Minneriya, Kaudulla, and Hurulu elephant safaris, Habarana village tours, and Sri Lanka's Cultural Triangle.",
    alternates: { canonical: "/blogs" },
    robots: hasFilteredView
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: "Safari Guides & Habarana Travel Blog",
      description:
        "Practical safari planning and local travel advice from Habarana.",
      url: "/blogs",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: "Ceylon Safari wildlife and village experiences in Habarana",
        },
      ],
    },
  }
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || ""
}

function normalizeCategory(value: string) {
  const category = value.trim().toLowerCase()
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)
    ? category.slice(0, 100)
    : ""
}

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80)
}

function toSearchPattern(value: string) {
  const terms = value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return terms.length > 0 ? `*${terms.join("*")}*` : ""
}

function createBlogUrl({
  category,
  search,
  page,
}: {
  category?: string
  search?: string
  page?: number
}) {
  const params = new URLSearchParams()
  if (category) params.set("category", category)
  if (search) params.set("search", search)
  if (page && page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/blogs?${query}` : "/blogs"
}

async function BlogSearch({
  searchParams,
}: {
  searchParams: BlogSearchParams
}) {
  const params = await searchParams
  const category = normalizeCategory(readParam(params.category))
  const search = normalizeSearch(readParam(params.search))

  return (
    <form action="/blogs" className="relative mx-auto max-w-md" role="search">
      <MagnifyingGlass className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        name="search"
        placeholder="Search blog posts..."
        defaultValue={search}
        className="bg-white pr-24 pl-10 text-gray-900"
        maxLength={80}
      />
      {category && <input type="hidden" name="category" value={category} />}
      <Button
        type="submit"
        size="sm"
        className="absolute top-1/2 right-1.5 -translate-y-1/2"
      >
        Search
      </Button>
    </form>
  )
}

function BlogGridSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12" aria-busy="true">
      <div className="mb-8 h-16 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    </div>
  )
}

async function BlogResults({
  searchParams,
}: {
  searchParams: BlogSearchParams
}) {
  const params = await searchParams
  const category = normalizeCategory(readParam(params.category))
  const search = normalizeSearch(readParam(params.search))
  const requestedPage = Number.parseInt(readParam(params.page) || "1", 10)
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(requestedPage, 1000))
    : 1
  const start = (page - 1) * POSTS_PER_PAGE

  const [categories, result] = await Promise.all([
    getCategories(),
    getBlogIndex({
      category,
      search: toSearchPattern(search),
      start,
      end: start + POSTS_PER_PAGE,
    }),
  ])

  const categoryItems = categories as unknown as Array<{
    title: string
    slug: string
  }>
  const posts = (result.posts ?? []) as unknown as Post[]
  const total = result.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8" aria-label="Blog categories">
        <h2 className="mb-4 text-lg font-semibold">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <Badge
            asChild
            variant={category ? "outline" : "default"}
            className="transition-colors"
          >
            <Link href={createBlogUrl({ search })}>All Posts</Link>
          </Badge>
          {categoryItems.map((item) => {
            const slug = item.slug || ""
            if (!slug) return null

            return (
              <Badge
                asChild
                key={slug}
                variant={category === slug ? "default" : "outline"}
                className="transition-colors"
              >
                <Link href={createBlogUrl({ category: slug, search })}>
                  {item.title}
                </Link>
              </Badge>
            )
          })}
        </div>
      </nav>

      <p className="mb-6 text-gray-600" aria-live="polite">
        {search
          ? `${total} result${total === 1 ? "" : "s"} for “${search}”`
          : `${total} article${total === 1 ? "" : "s"}`}
      </p>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard
                key={`${String(post.slug)}-${post._updatedAt}`}
                post={post}
                index={index}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <nav
              className="mt-12 flex items-center justify-center gap-4"
              aria-label="Blog pagination"
            >
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link
                    href={createBlogUrl({
                      category,
                      search,
                      page: page - 1,
                    })}
                    rel="prev"
                  >
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Previous
                </Button>
              )}
              <span className="text-sm text-gray-600">
                Page {Math.min(page, pageCount)} of {pageCount}
              </span>
              {page < pageCount ? (
                <Button asChild variant="outline">
                  <Link
                    href={createBlogUrl({
                      category,
                      search,
                      page: page + 1,
                    })}
                    rel="next"
                  >
                    Next
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Next
                </Button>
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg text-gray-500">
            No blog posts found matching your criteria.
          </p>
          <Button asChild variant="link">
            <Link href="/blogs">Clear filters</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function BlogsPage({
  searchParams,
}: {
  searchParams: BlogSearchParams
}) {
  return (
    <main className="bg-gray-50 pt-20">
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Travel Blog
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg md:text-xl">
            Discover safari guides, wildlife stories, and local travel advice
            from Sri Lanka&apos;s Cultural Triangle.
          </p>
          <Suspense
            fallback={
              <div className="mx-auto h-9 max-w-md animate-pulse rounded-md bg-white/30" />
            }
          >
            <BlogSearch searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogResults searchParams={searchParams} />
      </Suspense>
      <MobileContactBar />
    </main>
  )
}
