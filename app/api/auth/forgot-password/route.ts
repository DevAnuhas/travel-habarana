import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import PasswordResetToken from "@/models/PasswordResetToken"
import { siteConfig } from "@/config/site"
import {
  getEmailSender,
  getEmailTransporter,
  passwordResetAdminTemplate,
} from "@/lib/email-service"
import { getClientAddress, parseJsonBody } from "@/lib/api"
import { enforceRateLimit } from "@/lib/rate-limit"
import { withErrorHandler } from "@/middleware/error-handler"

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
})

export async function POST(request: NextRequest) {
  return withErrorHandler(request, async () => {
    const { email } = await parseJsonBody(request, forgotPasswordSchema, 4_096)
    const clientAddress = getClientAddress(request.headers)

    await enforceRateLimit({
      scope: "forgot-password",
      identifier: `${clientAddress}:${email}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, a reset link will be sent.",
      })
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id })

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    // Create new reset token (expires in 1 hour)
    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    // Send password reset email
    try {
      const transporter = getEmailTransporter()

      await transporter.sendMail({
        from: getEmailSender(`${siteConfig.name} Admin`),
        to: email,
        subject: `Password Reset Request - ${siteConfig.name} Admin`,
        html: passwordResetAdminTemplate(resetToken, user.email),
      })
    } catch (error) {
      console.error("Failed to send password reset email:", error)
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, a reset link will be sent.",
    })
  })
}
