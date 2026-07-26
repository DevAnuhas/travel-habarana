/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { NextStudio } from "next-sanity/studio";

import { authOptions } from "@/lib/auth-options";
import config from "../../../../sanity.config";

export const dynamic = "force-dynamic";

export { metadata, viewport } from "next-sanity/studio";

export default async function StudioPage() {
	const session = await getServerSession(authOptions);
	if (session?.user?.role !== "admin") {
		redirect("/admin/login");
	}

	return <NextStudio config={config} />;
}
