import "server-only";

import { createHash } from "node:crypto";

import connectMongoDB from "@/lib/mongodb";
import { TooManyRequestsError } from "@/lib/errors";
import RateLimit from "@/models/RateLimit";

interface RateLimitOptions {
	scope: string;
	identifier: string;
	limit: number;
	windowMs: number;
}

function createRateLimitKey(scope: string, identifier: string) {
	const salt =
		process.env.RATE_LIMIT_SALT ||
		process.env.NEXTAUTH_SECRET ||
		"ceylon-safari-rate-limit";

	return createHash("sha256")
		.update(`${salt}:${scope}:${identifier}`)
		.digest("hex");
}

export async function enforceRateLimit({
	scope,
	identifier,
	limit,
	windowMs,
}: RateLimitOptions) {
	await connectMongoDB();

	const key = createRateLimitKey(scope, identifier);
	const now = new Date();
	const resetAt = new Date(now.getTime() + windowMs);

	let entry = await RateLimit.findOneAndUpdate(
		{ key, resetAt: { $gt: now } },
		{ $inc: { count: 1 } },
		{ new: true }
	);

	if (!entry) {
		try {
			entry = await RateLimit.findOneAndUpdate(
				{ key },
				{ $set: { count: 1, resetAt } },
				{ new: true, upsert: true }
			);
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === 11000
			) {
				entry = await RateLimit.findOneAndUpdate(
					{ key, resetAt: { $gt: now } },
					{ $inc: { count: 1 } },
					{ new: true }
				);
			} else {
				throw error;
			}
		}
	}

	if (entry && entry.count > limit) {
		const retryAfterSeconds = Math.max(
			1,
			Math.ceil((entry.resetAt.getTime() - now.getTime()) / 1000)
		);
		throw new TooManyRequestsError(retryAfterSeconds);
	}
}

export async function clearRateLimit(scope: string, identifier: string) {
	await connectMongoDB();
	await RateLimit.deleteOne({ key: createRateLimitKey(scope, identifier) });
}
