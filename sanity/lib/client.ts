import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createClient, type QueryParams } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
	perspective: "published",
	stega: false,
});

export async function clientFetch<const QueryString extends string>({
	query,
	params = {},
	tags = [],
}: {
	query: QueryString;
	params?: QueryParams;
	tags?: string[];
}) {
	"use cache";
	cacheLife({ stale: 300, revalidate: 3600, expire: 604800 });
	cacheTag("sanity", ...tags);

	return client.fetch(query, params);
}
