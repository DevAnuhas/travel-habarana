import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { passwordPolicySchema } from "@/lib/types";
import { getClientAddress, parseJsonBody } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withErrorHandler } from "@/middleware/error-handler";

const resetPasswordSchema = z.object({
	token: z.string().trim().length(64, "Invalid reset token"),
	password: passwordPolicySchema,
});

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		const { token, password } = await parseJsonBody(
			request,
			resetPasswordSchema,
			4_096
		);
		const clientAddress = getClientAddress(request.headers);

		await enforceRateLimit({
			scope: "reset-password",
			identifier: clientAddress,
			limit: 10,
			windowMs: 60 * 60 * 1000,
		});

		await connectDB();

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

		// Update user password
		const hashedPassword = await bcrypt.hash(password, 12);
		await User.updateOne({ _id: user._id }, { password: hashedPassword });

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
			{ status: 201 }
		);
	});
}
