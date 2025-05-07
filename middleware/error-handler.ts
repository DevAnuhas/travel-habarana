import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AppError, ForbiddenError } from "@/lib/errors";

export type ApiHandler = (
	req: NextRequest,
	context?: Record<string, unknown>
) => Promise<NextResponse>;

export async function withErrorHandler(
	req: NextRequest,
	handler: (req: NextRequest) => Promise<NextResponse>
) {
	try {
		return await handler(req);
	} catch (error) {
		console.error("API Error: ", error);

		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			);
		}

		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function withAdminAuth(
	req: NextRequest,
	handler: (req: NextRequest) => Promise<NextResponse>
) {
	const token = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	});

	if (!token || token.role !== "admin") {
		throw new ForbiddenError("Forbidden access");
	}

	return handler(req);
}
