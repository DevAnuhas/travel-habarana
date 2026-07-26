import { DocumentTextIcon } from "@sanity/icons/DocumentText"
import { defineArrayMember, defineField, defineType } from "sanity"

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "Search & social" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().min(10).max(80),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      group: "content",
      to: { type: "author" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      type: "image",
      group: "content",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          description:
            "Describe the image for visitors who cannot see it. Avoid keyword stuffing.",
          validation: (Rule) => Rule.required().min(5).max(140),
        }),
      ],
    }),
    defineField({
      name: "categories",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: { type: "category" } })],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "Used on article cards and as the default search description.",
      validation: (Rule) => Rule.required().min(50).max(160),
    }),
    defineField({
      name: "body",
      type: "blockContent",
      group: "content",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "isFeatured",
      title: "Feature on home page",
      type: "boolean",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "seo",
      title: "Search and social overrides",
      type: "object",
      group: "seo",
      fields: [
        defineField({
          name: "title",
          title: "Search title",
          type: "string",
          description: "Optional. The article title is used when left blank.",
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: "description",
          title: "Search description",
          type: "text",
          rows: 3,
          description: "Optional. Aim for 120–160 characters.",
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: "socialImage",
          title: "Social sharing image",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              validation: (Rule) => Rule.max(140),
            }),
          ],
        }),
        defineField({
          name: "noIndex",
          title: "Hide from search engines",
          type: "boolean",
          description:
            "Use only for drafts or content that should not appear in search.",
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      isFeatured: "isFeatured",
    },
    prepare({ author, isFeatured, ...selection }) {
      return {
        ...selection,
        subtitle: author
          ? `${isFeatured ? "Featured · " : ""}By ${author}`
          : "Missing author",
      }
    },
  },
})
