import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { passwordChangeSchema } from "@/lib/types";
import {
	NotFoundError,
	ForbiddenError,
	UnauthorizedError,
	ValidationError,
} from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

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

			const body = await req.json();

			// Validate request body
			const validatedData = passwordChangeSchema.parse(body);

			await connectMongoDB();

			// Find user
			const user = await User.findById(token.id);
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
