import { type NextRequest, NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// Get a signed URL for an image upload to Cloudinary
export async function GET(req: NextRequest) {
	return withErrorHandler(req, async (req) => {
		return withAdminAuth(req, async () => {
			try {
				const { cloudinary, config } = getCloudinary();
				const timestamp = Math.round(new Date().getTime() / 1000);

				// Parameters for signing (must match what's sent to Cloudinary)
				const params = {
					timestamp: timestamp,
					upload_preset: config.uploadPreset,
				};

				// Generate the signature using Cloudinary's utility
				const signature = cloudinary.utils.api_sign_request(
					params,
					config.apiSecret
				);

				return NextResponse.json({
					signature,
					timestamp,
					cloudName: config.cloudName,
					apiKey: config.apiKey,
					uploadPreset: config.uploadPreset,
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
