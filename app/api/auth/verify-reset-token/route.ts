import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";

const verifyTokenSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { token } = verifyTokenSchema.parse(body);

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
	} catch (error) {
		console.error("Verify reset token error:", error);

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
