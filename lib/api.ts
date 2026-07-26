import "server-only";

import { type NextRequest } from "next/server";
import { z } from "zod";

import {
	PayloadTooLargeError,
	ValidationError,
} from "@/lib/errors";

const JSON_CONTENT_TYPE = "application/json";

export async function parseJsonBody<T>(
	request: NextRequest,
	schema: z.ZodType<T>,
	maxBytes = 16_384
): Promise<T> {
	const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
	if (!contentType.includes(JSON_CONTENT_TYPE)) {
		throw new ValidationError("Content-Type must be application/json");
	}

	const declaredLength = Number(request.headers.get("content-length"));
	if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
		throw new PayloadTooLargeError();
	}

	const rawBody = await request.text();
	if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
		throw new PayloadTooLargeError();
	}

	let body: unknown;
	try {
		body = JSON.parse(rawBody);
	} catch {
		throw new ValidationError("Request body must contain valid JSON");
	}

	return schema.parse(body);
}

export function getClientAddress(
	headers: Headers | Record<string, string | string[] | undefined>
): string {
	const readHeader = (name: string) => {
		if (headers instanceof Headers) {
			return headers.get(name) ?? undefined;
		}

		const value = headers[name] ?? headers[name.toLowerCase()];
		return Array.isArray(value) ? value[0] : value;
	};

	return (
		readHeader("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
		readHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
		readHeader("x-real-ip")?.trim() ||
		"unknown"
	);
}
