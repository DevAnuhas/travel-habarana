import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { passwordResetAdminTemplate } from "@/lib/email-templates";
import nodemailer from "nodemailer";

// Configure nodemailer transporter
const getEmailTransporter = () => {
	return nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});
};

const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { email } = forgotPasswordSchema.parse(body);

		// Find user by email
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "A user with this email address was not found",
				},
				{ status: 404 }
			);
		}

		// Delete any existing reset tokens for this user
		await PasswordResetToken.deleteMany({ userId: user._id });

		// Generate secure reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Create new reset token (expires in 1 hour)
		await PasswordResetToken.create({
			userId: user._id,
			token: hashedToken,
			expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
		});

		// Send password reset email
		try {
			const transporter = getEmailTransporter();

			await transporter.sendMail({
				from: `"Travel Habarana Admin" <${process.env.EMAIL_USER}>`,
				to: email,
				subject: "Password Reset Request - Travel Habarana Admin",
				html: passwordResetAdminTemplate(resetToken, user.email),
			});
		} catch (error) {
			console.error("Failed to send password reset email:", error);
			return NextResponse.json(
				{ success: false, message: "Failed to send password reset email" },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message:
					"Password reset link has been sent. Check your email for instructions.",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Forgot password error:", error);

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
