import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// GET all users
export async function GET(req: NextRequest) {
	return withErrorHandler(req, async (req) => {
		return withAdminAuth(req, async () => {
			await connectMongoDB();

			const users = await User.find({})
				.select("-password")
				.sort({ createdAt: -1 });

			return NextResponse.json(users);
		});
	});
}
