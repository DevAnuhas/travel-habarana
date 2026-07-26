import { CommentIcon } from "@sanity/icons/Comment"
import { defineField, defineType } from "sanity"

export const commentType = defineType({
  name: "comment",
  type: "document",
  title: "Comment",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "approved",
      title: "Approved",
      type: "boolean",
      description: "Comments are hidden from the public site until approved.",
      initialValue: false,
    }),
    defineField({
      name: "comment",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required().min(3).max(2000),
    }),
    defineField({
      name: "post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      approved: "approved",
      comment: "comment",
    },
    prepare({ title, approved, comment }) {
      return {
        title,
        subtitle: `${approved ? "Approved" : "In review"} · ${comment || ""}`,
        media: CommentIcon,
      }
    },
  },
})
