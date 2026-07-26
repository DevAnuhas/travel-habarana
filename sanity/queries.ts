import { defineQuery } from "next-sanity"
import { clientFetch } from "./lib/client"

const FEATURED_POSTS_QUERY =
  defineQuery(`*[_type=='post' && isFeatured==true && seo.noIndex != true] | order(publishedAt desc)[0...$quantity]{
    title,
    'slug':slug.current,
    publishedAt,
    mainImage,
    excerpt,
    author->{
        name, image
    }
}`)

export const getFeaturedPosts = async (quantity: number) => {
  return await clientFetch({
    query: FEATURED_POSTS_QUERY,
    params: { quantity },
    tags: ["post", "featured-post"],
  })
}

const ALL_POSTS_QUERY = defineQuery(`*[
  _type == "post"
  && seo.noIndex != true
]|order(publishedAt desc)[$start...$end]{
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  excerpt,
  author->{
    name,
    image,
  },
  _updatedAt
}`)

export const getAllPosts = async (start: number = 0, end: number = 7) => {
  return await clientFetch({
    query: ALL_POSTS_QUERY,
    params: { start, end },
    tags: ["post"],
  })
}

// Query to get total number of posts
const POST_COUNT_QUERY = defineQuery(
  `count(*[_type == "post" && seo.noIndex != true])`
)

export const getPostsCount = async () => {
  return await clientFetch({
    query: POST_COUNT_QUERY,
    tags: ["post"],
  })
}

const CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
  && count(*[
    _type == "post"
    && seo.noIndex != true
    && references(^._id)
  ]) > 0
]|order(title asc){
  title,
  "slug":slug.current
}`)

export const getCategories = async () => {
  return await clientFetch({
    query: CATEGORIES_QUERY,
    tags: ["category"],
  })
}

const POST_QUERY = defineQuery(`*[_type=='post' && slug.current == $slug][0]{
  _updatedAt,
  "slug": slug.current,
  publishedAt,
  title,
  mainImage,
  excerpt,
  body,
  _id,
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  },
  seo{
    title,
    description,
    socialImage,
    noIndex
  },
  "comments": *[_type == "comment" && post._ref == ^._id && approved == true]{
    name,
    comment,
    _id
  }
}`)

export const getPost = async (slug: string) => {
  return await clientFetch({
    query: POST_QUERY,
    params: { slug },
    tags: ["post", "comment", `post:${slug}`],
  })
}

const CATEGORY_POST = defineQuery(`*[
  _type == "post"
  && seo.noIndex != true
  && select(defined($category) => $category in categories[]->slug.current, true)
]|order(publishedAt desc)[$start...$end]{
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  excerpt,
  author->{
    name,
    image,
  },
}`)

export const getCategoryPost = async (
  category?: string,
  start: number = 0,
  end: number = 7
) => {
  return await clientFetch({
    query: CATEGORY_POST,
    params: {
      category,
      start,
      end,
    },
    tags: ["post", "category"],
  })
}

// Query to get total number of posts in a category
const CATEGORY_POST_COUNT_QUERY = defineQuery(`count(*[
  _type == "post"
  && seo.noIndex != true
  && select(defined($category) => $category in categories[]->slug.current, true)
])`)

export const getCategoryPostCount = async (category?: string) => {
  return await clientFetch({
    query: CATEGORY_POST_COUNT_QUERY,
    params: { category },
    tags: ["post", "category"],
  })
}

const GET_OTHERS_POSTS_QUERY = defineQuery(`*[
  _type == "post"
  && seo.noIndex != true
  && defined(slug.current)
  && slug.current != $currentSlug
]|order(publishedAt desc)[0...$quantity]{
  publishedAt,
  title,
  mainImage,
  excerpt,
  body,
  slug,
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}`)

export const getOtherPosts = async (currentSlug: string, quantity: number) => {
  return await clientFetch({
    query: GET_OTHERS_POSTS_QUERY,
    params: { currentSlug, quantity },
    tags: ["post"],
  })
}

const BLOG_INDEX_QUERY = defineQuery(`{
  "posts": *[
    _type == "post"
    && seo.noIndex != true
    && defined(slug.current)
    && ($category == "" || $category in categories[]->slug.current)
    && ($search == "" || title match $search || excerpt match $search)
  ] | order(publishedAt desc)[$start...$end]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    publishedAt,
    mainImage,
    excerpt,
    isFeatured
  },
  "total": count(*[
    _type == "post"
    && seo.noIndex != true
    && defined(slug.current)
    && ($category == "" || $category in categories[]->slug.current)
    && ($search == "" || title match $search || excerpt match $search)
  ])
}`)

export async function getBlogIndex({
  category = "",
  search = "",
  start = 0,
  end = 9,
}: {
  category?: string
  search?: string
  start?: number
  end?: number
}) {
  return clientFetch({
    query: BLOG_INDEX_QUERY,
    params: { category, search, start, end },
    tags: ["post", "category"],
  })
}

const POST_SLUGS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)]{
    "isIndexable": seo.noIndex != true,
    "slug": slug.current,
    _updatedAt
  }[isIndexable == true]`
)

export async function getPostSlugs() {
  return clientFetch({
    query: POST_SLUGS_QUERY,
    tags: ["post"],
  })
}
