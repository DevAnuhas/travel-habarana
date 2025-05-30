/**
 * Utility function for generating URL-friendly slugs
 */

/**
 * Generates a URL-friendly slug from a string
 *
 * @param text The text to convert to a slug
 * @returns Normalized slug string
 */
export function generateSlug(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/&/g, "-and-") // Replace & with 'and'
		.replace(/[^\w\-]+/g, "") // Remove all non-word characters
		.replace(/\-\-+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start of text
		.replace(/-+$/, ""); // Trim - from end of text
}
