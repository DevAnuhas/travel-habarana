import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";
import { getClientAddress, parseJsonBody } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withErrorHandler } from "@/middleware/error-handler";

const verifyTokenSchema = z.object({
	token: z.string().trim().length(64, "Invalid reset token"),
});

export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		const { token } = await parseJsonBody(
			request,
			verifyTokenSchema,
			4_096
		);

		await enforceRateLimit({
			scope: "verify-reset-token",
			identifier: getClientAddress(request.headers),
			limit: 20,
			windowMs: 15 * 60 * 1000,
		});

		await connectDB();

		// Hash the provided token to compare with stored hash
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		// Find the reset token
		const resetToken = await PasswordResetToken.findOne({
			token: hashedToken,
			used: false,
			expiresAt: { $gt: new Date() },
		}).populate("userId");

		if (!resetToken) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid or expired reset token",
				},
				{ status: 400 }
			);
		}

		// Verify user still exists
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

		return NextResponse.json(
			{
				success: true,
				message: "Token is valid",
				email: user.email,
			},
			{ status: 200 }
		);
	});
}
