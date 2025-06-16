import { defineQuery } from "next-sanity";
import { clientFetch } from "./lib/client";

const FEATURED_POSTS_QUERY =
	defineQuery(`*[_type=='post' && isFeatured==true] | order(publishedAt desc)[0...$quantity]{
    title,
    'slug':slug.current,
    publishedAt,
    mainImage,
    excerpt,
    author->{
        name, image
    }
}`);

export const getFeaturedPosts = async (quantity: number) => {
	return await clientFetch({
		query: FEATURED_POSTS_QUERY,
		params: { quantity },
	});
};

const ALL_POSTS_QUERY = defineQuery(`*[
  _type == "post"
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
}`);

export const getAllPosts = async (start: number = 0, end: number = 7) => {
	return await clientFetch({
		query: ALL_POSTS_QUERY,
		params: { start, end },
	});
};

// Query to get total number of posts
const POST_COUNT_QUERY = defineQuery(`count(*[_type == "post"])`);

export const getPostsCount = async () => {
	return await clientFetch({
		query: POST_COUNT_QUERY,
	});
};

const CATEGORIES_QUERY = defineQuery(`*[_type=='category']|order(title asc){
  title,
  "slug":slug.current
}`);

export const getCategories = async () => {
	return await clientFetch({
		query: CATEGORIES_QUERY,
	});
};

const POST_QUERY = defineQuery(`*[_type=='post' && slug.current == $slug][0]{
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
  "comments": *[_type == "comment" && post._ref == ^._id && approved == true]{
    name,
    email,
    comment,
    image,
    _id
  }
}`);

export const getPost = async (slug: string) => {
	return await clientFetch({
		query: POST_QUERY,
		params: { slug },
	});
};

const CATEGORY_POST = defineQuery(`*[
  _type == "post"
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
}`);

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
	});
};

// Query to get total number of posts in a category
const CATEGORY_POST_COUNT_QUERY = defineQuery(`count(*[
  _type == "post"
  && select(defined($category) => $category in categories[]->slug.current, true)
])`);

export const getCategoryPostCount = async (category?: string) => {
	return await clientFetch({
		query: CATEGORY_POST_COUNT_QUERY,
		params: { category },
	});
};

const GET_OTHERS_POSTS_QUERY = defineQuery(`*[
  _type == "post"
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
}`);

export const getOtherPosts = async (currentSlug: string, quantity: number) => {
	return await clientFetch({
		query: GET_OTHERS_POSTS_QUERY,
		params: { currentSlug, quantity },
	});
};
