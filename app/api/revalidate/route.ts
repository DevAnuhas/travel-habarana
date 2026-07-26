import { timingSafeEqual } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { parseJsonBody } from "@/lib/api";
import { UnauthorizedError } from "@/lib/errors";
import { withErrorHandler } from "@/middleware/error-handler";

const webhookSchema = z.object({
	_type: z.enum(["post", "comment", "author", "category"]),
	isFeatured: z.boolean().optional(),
	slug: z.object({ current: z.string().max(200) }).optional(),
});

function hasValidSecret(request: NextRequest) {
	const configuredSecret = process.env.SANITY_WEBHOOK_SECRET;
	const providedSecret = request.headers.get("x-webhook-secret");

	if (!configuredSecret || !providedSecret) {
		return false;
	}

	const expected = Buffer.from(configuredSecret);
	const provided = Buffer.from(providedSecret);
	return (
		expected.length === provided.length && timingSafeEqual(expected, provided)
	);
}

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		if (!hasValidSecret(request)) {
			throw new UnauthorizedError("Invalid webhook secret");
		}

		const body = await parseJsonBody(request, webhookSchema, 16_384);

		revalidateTag("sanity", "max");
		revalidateTag(body._type, "max");
		revalidatePath("/");
		revalidatePath("/blogs");
		revalidatePath("/sitemap.xml");

		if (body.slug?.current) {
			revalidatePath(`/blogs/${body.slug.current}`);
		}

		return NextResponse.json({ revalidated: true });
	});
}
