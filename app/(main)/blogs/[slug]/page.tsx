import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { CalendarDots } from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@/components/ui/badge"
import { BlogCard } from "@/components/ui/blog-card"
import { getOtherPosts, getPost, getPostSlugs } from "@/sanity/queries"
import { PortableText } from "next-sanity"
import {
  GET_OTHERS_POSTS_QUERYResult,
  POST_QUERYResult,
  Post,
} from "@/sanity/types"
import { urlFor } from "@/sanity/lib/image"
import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import WriteComment from "@/components/ui/write-comment"
import ShareArticle from "@/components/ui/share-article"
import { JsonLd } from "@/components/seo/json-ld"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

type BlogCategory = NonNullable<
  NonNullable<POST_QUERYResult>["categories"]
>[number]
type BlogComment = NonNullable<
  NonNullable<POST_QUERYResult>["comments"]
>[number]
type RelatedPost = GET_OTHERS_POSTS_QUERYResult[number]
type BlogPost = NonNullable<POST_QUERYResult> & {
  _updatedAt?: string
  slug?: string
  seo?: {
    title?: string
    description?: string
    socialImage?: NonNullable<POST_QUERYResult>["mainImage"]
    noIndex?: boolean
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const [postResult, otherPosts] = await Promise.all([
    getPost(slug),
    getOtherPosts(slug, 3),
  ])
  const post = postResult as BlogPost | null
  if (!post) notFound()
  const canonicalUrl = new URL(`/blogs/${slug}`, siteConfig.url).toString()
  const articleImage = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).fit("crop").url()
    : new URL(siteConfig.ogImage, siteConfig.url).toString()
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      headline: post.title,
      description: post.seo?.description || post.excerpt,
      image: articleImage,
      datePublished: post.publishedAt,
      dateModified: post._updatedAt || post.publishedAt,
      mainEntityOfPage: canonicalUrl,
      inLanguage: "en",
      author: {
        "@type": "Person",
        name: post.author?.name || siteConfig.name,
      },
      publisher: { "@id": `${siteConfig.url}/#business` },
      articleSection: post.categories?.map((category) => category.title),
      commentCount: post.comments?.length || 0,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Safari guides",
          item: new URL("/blogs", siteConfig.url).toString(),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={structuredData} />
      {/* Article Content */}
      <article className="container mx-auto px-4 pt-20">
        <div className="mx-auto max-w-2xl pt-16">
          {/* Article Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories?.map((category: BlogCategory) => (
                <Link
                  key={category.slug}
                  href={`/blogs?category=${category.slug}`}
                >
                  <Badge
                    variant="outline"
                    className="transition-colors hover:bg-primary hover:text-white"
                  >
                    {category.title}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 className="mb-6 text-3xl leading-tight font-bold text-gray-900 md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <div className="mb-6 flex items-center space-x-2 text-gray-600">
              <CalendarDots className="h-4 w-4" />
              <span>{formatDate(post.publishedAt || "")}</span>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-[16/9] h-auto w-full overflow-hidden">
              {post?.mainImage && (
                <Image
                  src={urlFor(post?.mainImage).url()}
                  fill
                  className="rounded-lg object-cover"
                  alt={post.mainImage.alt || post.title || "Safari guide"}
                />
              )}
              <div className="bg-opacity-20 inset-0 z-100 bg-black" />
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
                      <h2 className="mt-8 mb-4 text-2xl font-bold text-gray-900 first:mt-0 last:mb-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mt-6 mb-3 text-xl font-bold text-gray-900 first:mt-0 last:mb-0">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-6 border-l-4 border-primary pl-4 text-gray-700 italic first:mt-0 last:mb-0">
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
                        className="w-full rounded-lg shadow-md"
                      />
                    ),
                    separator: ({ value }) => {
                      switch (value.style) {
                        case "line":
                          return (
                            <hr className="my-8 border-t border-gray-200" />
                          )
                        case "space":
                          return <div className="my-8" />
                        default:
                          return null
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
                      )
                    },
                    number: ({ children }) => {
                      return (
                        <li className="my-2 pl-2 has-[br]:mb-8">{children}</li>
                      )
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
                      if (!value?.href) {
                        return <>{children}</>
                      }

                      return (
                        <Link
                          href={value.href}
                          className="font-medium text-gray-950 underline decoration-gray-400 underline-offset-4 data-[hover]:decoration-gray-600"
                        >
                          {children}
                        </Link>
                      )
                    },
                  },
                }}
              />
            )}
          </div>

          <div className="mt-16 flex w-full items-center justify-between pb-8">
            {/* Author Section */}
            <div className="flex max-w-2xl items-center space-x-4">
              <Image
                src={
                  post?.author?.image
                    ? urlFor(post.author.image).url()
                    : "/assets/avatar-placeholder.svg"
                }
                alt="Author Avatar"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="-mb-1 text-sm text-gray-600">Author</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {post?.author?.name || "Unknown Author"}
                </h3>
              </div>
            </div>

            {/* Share Article Section */}
            <ShareArticle
              post={{ title: post?.title ?? "Ceylon Safari guide" }}
            />
          </div>
          <hr />
        </div>

        {/* Comments Section */}
        {post?.comments?.length > 0 && (
          <div className="mt-16">
            <div className="mx-auto flex w-full max-w-2xl flex-col space-y-2 rounded-md border p-8 shadow sm:p-10">
              <h3 className="text-4xl font-semibold">
                Comments ({post?.comments?.length})
              </h3>
              <hr className="pb-2" />
              {post?.comments?.map((comment: BlogComment) => (
                <div
                  key={comment?._id}
                  className="flex space-y-2 border bg-accent-foreground/50 p-4"
                >
                  <Image
                    src="/assets/avatar-placeholder.svg"
                    alt="User Avatar"
                    width={48}
                    height={48}
                    className="mr-6 mb-0 rounded-full"
                  />
                  <p>
                    <span className="font-semibold">{comment?.name}</span>
                    <br />
                    {comment?.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <WriteComment _id={post?._id} />
      </article>

      {/* Related Posts */}
      {otherPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 md:text-3xl">
              Related Articles
            </h2>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((relatedPost: RelatedPost) => (
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
  )
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getPostSlugs()

  return posts.map((post: { slug?: string | null }) => ({
    slug: post.slug || "",
  }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = (await getPost(slug)) as BlogPost | null

  if (!post) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    }
  }

  const title = post.seo?.title || post.title || "Safari guide"
  const description =
    post.seo?.description ||
    post.excerpt ||
    "Read local safari planning advice from Ceylon Safari in Habarana."
  const socialImage = post.seo?.socialImage || post.mainImage
  const image = socialImage
    ? urlFor(socialImage).width(1200).height(630).fit("crop").url()
    : siteConfig.ogImage
  const canonical = `/blogs/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !post.seo?.noIndex,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post._updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: socialImage?.alt || post.title || "Ceylon Safari travel guide",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}
