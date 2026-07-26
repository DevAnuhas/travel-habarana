import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { userCreateSchema } from "@/lib/types";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors";
import { parseJsonBody } from "@/lib/api";

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const user = await parseJsonBody(request, userCreateSchema, 4_096);
			await connectMongoDB();

			// Check if user already exists
			const existingUser = await User.findOne({ email: user.email });
			if (existingUser) {
				throw new ValidationError("User with this email already exists");
			}

			await User.create(user);
			return NextResponse.json(
				{ message: "User created successfully" },
				{ status: 201 }
			);
		});
	});
}
