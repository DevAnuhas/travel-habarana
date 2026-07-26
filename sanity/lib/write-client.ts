import "server-only";

import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

let writeClient: SanityClient | null = null;

export function getSanityWriteClient() {
	const token = process.env.SANITY_API_TOKEN;
	if (!token) {
		throw new Error("Sanity write access is not configured");
	}

	writeClient ??= createClient({
		projectId,
		dataset,
		apiVersion,
		token,
		useCdn: false,
		perspective: "published",
	});

	return writeClient;
}
