import { type NextRequest, NextResponse } from "next/server";

import { getClientAddress, parseJsonBody } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { commentRequestSchema } from "@/lib/types";
import { withErrorHandler } from "@/middleware/error-handler";
import { getSanityWriteClient } from "@/sanity/lib/write-client";

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		const data = await parseJsonBody(request, commentRequestSchema, 8_192);
		const clientAddress = getClientAddress(request.headers);

		await enforceRateLimit({
			scope: "public-comment",
			identifier: `${clientAddress}:${data._id}`,
			limit: 3,
			windowMs: 10 * 60 * 1000,
		});

		const writeClient = getSanityWriteClient();
		const postExists = await writeClient.fetch<boolean>(
			"count(*[_type == 'post' && _id == $postId]) > 0",
			{ postId: data._id }
		);

		if (!postExists) {
			throw new NotFoundError("Post not found");
		}

		await writeClient.create({
			_type: "comment",
			post: {
				_type: "reference",
				_ref: data._id,
			},
			name: data.name,
			comment: data.comment,
			approved: false,
		});

		return NextResponse.json(
			{ message: "Comment submitted for moderation" },
			{ status: 201 }
		);
	});
}
