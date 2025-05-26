import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

const resetPasswordSchema = z.object({
	token: z.string().min(1, "Token is required"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { token, password } = resetPasswordSchema.parse(body);

		// Hash the provided token to compare with stored hash
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		// Find the reset token
		const resetToken = await PasswordResetToken.findOne({
			token: hashedToken,
			used: false,
			expiresAt: { $gt: new Date() },
		});

		if (!resetToken) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid or expired reset token",
				},
				{ status: 400 }
			);
		}

		// Find the user
		const user = await User.findById(resetToken.userId);
		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 400 }
			);
		}

		// Hash the new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Update user password
		await User.findByIdAndUpdate(user._id, {
			password: hashedPassword,
			updatedAt: new Date(),
		});

		// Mark the reset token as used
		await PasswordResetToken.findByIdAndUpdate(resetToken._id, {
			used: true,
		});

		// Delete all other reset tokens for this user
		await PasswordResetToken.deleteMany({
			userId: user._id,
			_id: { $ne: resetToken._id },
		});

		return NextResponse.json(
			{
				success: true,
				message: "Password has been reset successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Reset password error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, message: error.errors[0].message },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ success: false, message: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
