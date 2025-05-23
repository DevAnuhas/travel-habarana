import { type NextRequest, NextResponse } from "next/server";
import cloudinary, { cloudinaryConfig } from "@/lib/cloudinary";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// Get a signed URL for an image upload to Cloudinary
export async function GET(req: NextRequest) {
	return withErrorHandler(req, async (req) => {
		return withAdminAuth(req, async () => {
			try {
				const timestamp = Math.round(new Date().getTime() / 1000);

				// Parameters for signing (must match what's sent to Cloudinary)
				const params = {
					timestamp: timestamp,
					upload_preset: cloudinaryConfig.uploadPreset,
				};

				// Generate the signature using Cloudinary's utility
				const signature = cloudinary.utils.api_sign_request(
					params,
					cloudinaryConfig.apiSecret as string
				);

				return NextResponse.json({
					signature,
					timestamp,
					cloudName: cloudinaryConfig.cloudName,
					apiKey: cloudinaryConfig.apiKey,
					uploadPreset: cloudinaryConfig.uploadPreset,
				});
			} catch (error) {
				console.error("Error generating signature:", error);
				return NextResponse.json(
					{ error: "Failed to generate upload signature" },
					{ status: 500 }
				);
			}
		});
	});
}
