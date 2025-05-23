import { v2 as cloudinary } from "cloudinary";

interface CloudinaryConfig {
	cloudName: string | undefined;
	apiKey: string | undefined;
	apiSecret: string | undefined;
	uploadPreset: string | undefined;
}

// Parse the CLOUDINARY_URL if available, otherwise use individual env vars
let cloudinaryConfig: CloudinaryConfig;

if (process.env.CLOUDINARY_URL) {
	// Parse the CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
	const url = new URL(process.env.CLOUDINARY_URL);
	cloudinaryConfig = {
		cloudName: url.hostname,
		apiKey: url.username,
		apiSecret: url.password,
		uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
	};
} else {
	// Fallback to individual environment variables
	cloudinaryConfig = {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME,
		apiKey: process.env.CLOUDINARY_API_KEY,
		apiSecret: process.env.CLOUDINARY_API_SECRET,
		uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
	};
}

// Validate configuration
if (
	!cloudinaryConfig.cloudName ||
	!cloudinaryConfig.apiKey ||
	!cloudinaryConfig.apiSecret
) {
	console.error("Missing Cloudinary configuration:", {
		hasCloudName: !!cloudinaryConfig.cloudName,
		hasApiKey: !!cloudinaryConfig.apiKey,
		hasApiSecret: !!cloudinaryConfig.apiSecret,
	});
}

// Configure Cloudinary
cloudinary.config({
	cloud_name: cloudinaryConfig.cloudName,
	api_key: cloudinaryConfig.apiKey,
	api_secret: cloudinaryConfig.apiSecret,
	secure: true,
});

export { cloudinaryConfig };
export default cloudinary;
