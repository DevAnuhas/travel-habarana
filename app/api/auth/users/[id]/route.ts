import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { objectIdSchema, passwordChangeSchema } from "@/lib/types";
import {
	NotFoundError,
	ForbiddenError,
	UnauthorizedError,
	ValidationError,
} from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { parseJsonBody } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";

// Change password
export async function PATCH(req: NextRequest) {
	return withErrorHandler(req, async () => {
		return withAdminAuth(req, async () => {
			const token = await getToken({
				req,
				secret: process.env.NEXTAUTH_SECRET,
			});

			if (!token || !token.id) {
				throw new UnauthorizedError();
			}

			// Validate request body
			const validatedData = await parseJsonBody(
				req,
				passwordChangeSchema,
				4_096
			);

			await enforceRateLimit({
				scope: "change-password",
				identifier: String(token.id),
				limit: 5,
				windowMs: 60 * 60 * 1000,
			});

			await connectMongoDB();

			// Find user
			const user = await User.findById(token.id).select("+password");
			if (!user) {
				throw new UnauthorizedError("User not found");
			}

			// Verify current password
			const isPasswordValid = await user.comparePassword(
				validatedData.currentPassword
			);
			if (!isPasswordValid) {
				throw new ValidationError("Current password is incorrect");
			}

			// Update password
			user.password = validatedData.newPassword;
			await user.save();

			return NextResponse.json({ message: "Password changed successfully" });
		});
	});
}

// Delete user
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(req, async (req) => {
		return withAdminAuth(req, async () => {
			const { id } = await params;
			objectIdSchema.parse(id);
			const token = await getToken({
				req,
				secret: process.env.NEXTAUTH_SECRET,
			});

			// Prevent deleting self
			if (token?.id === id) {
				throw new ForbiddenError("You cannot delete your own account");
			}

			await connectMongoDB();

			const deletedUser = await User.findByIdAndDelete(id);

			if (!deletedUser) {
				throw new NotFoundError("User not found");
			}

			return NextResponse.json({ message: "User deleted successfully" });
		});
	});
}
