import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { userSchema } from "@/lib/types";
import bcrypt from "bcryptjs";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const user = userSchema.safeParse(await request.json());

			if (!user.success) {
				return NextResponse.json(user.error.issues, { status: 400 });
			}

			const hashedPassword = await bcrypt.hash(user.data.password, 10);
			user.data.password = hashedPassword;

			await connectMongoDB();

			const newUser = User.create(user.data);
			return NextResponse.json(newUser, { status: 201 });
		});
	});
}
