import "server-only";

import { v2 as cloudinary } from "cloudinary";

interface CloudinaryConfig {
	cloudName: string;
	apiKey: string;
	apiSecret: string;
	uploadPreset: string;
}

let configured = false;
let cachedConfig: CloudinaryConfig | null = null;

export function getCloudinary() {
	if (!cachedConfig) {
		if (process.env.CLOUDINARY_URL) {
			const url = new URL(process.env.CLOUDINARY_URL);
			cachedConfig = {
				cloudName: url.hostname,
				apiKey: url.username,
				apiSecret: url.password,
				uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
			};
		} else {
			const {
				CLOUDINARY_CLOUD_NAME: cloudName,
				CLOUDINARY_API_KEY: apiKey,
				CLOUDINARY_API_SECRET: apiSecret,
				CLOUDINARY_UPLOAD_PRESET: uploadPreset,
			} = process.env;

			if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
				throw new Error("Cloudinary is not fully configured");
			}

			cachedConfig = { cloudName, apiKey, apiSecret, uploadPreset };
		}
	}

	if (!configured) {
		cloudinary.config({
			cloud_name: cachedConfig.cloudName,
			api_key: cachedConfig.apiKey,
			api_secret: cachedConfig.apiSecret,
			secure: true,
		});
		configured = true;
	}

	return { cloudinary, config: cachedConfig };
}
