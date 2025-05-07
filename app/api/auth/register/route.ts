import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { userSchema } from "@/lib/types";
import bcrypt from "bcryptjs";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const user = userSchema.safeParse(await request.json());

			if (!user.success) {
				return NextResponse.json(user.error.issues, { status: 400 });
			}

			// Check if user already exists
			const existingUser = await User.findOne({ email: user.data.email });
			if (existingUser) {
				throw new ValidationError("User with this email already exists");
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(user.data.password, 10);
			user.data.password = hashedPassword;

			user.data.role = "admin";

			await connectMongoDB();

			await User.create(user.data);
			return NextResponse.json("User created successfully");
		});
	});
}
