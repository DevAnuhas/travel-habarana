import "server-only";

import type { Types } from "mongoose";

import { contentRedirects } from "@/config/redirects";
import {
	chooseAvailableSlug,
	packageSlugBase,
	slugVariantPattern,
	type SlugOwner,
} from "@/lib/package-slugs";
import Package from "@/models/Package";

/**
 * A slug for `name` that no other package uses now or used before, and that no
 * site redirect claims. Pass the package's own id on rename so its own history
 * stays available to it.
 */
export async function findAvailableSlug(
	name: string,
	excludeId?: Types.ObjectId
): Promise<string> {
	// Only the slug and its numbered variants can collide.
	const pattern = slugVariantPattern(packageSlugBase(name));
	const others = await Package.find(
		{
			...(excludeId ? { _id: { $ne: excludeId } } : {}),
			$or: [{ slug: pattern }, { previousSlugs: pattern }],
		},
		{ slug: 1, previousSlugs: 1 }
	).lean<SlugOwner[]>();

	return chooseAvailableSlug(name, others, contentRedirects);
}
