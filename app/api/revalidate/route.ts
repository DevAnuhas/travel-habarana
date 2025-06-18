import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();

		// Verify the webhook secret if you have one
		const secret = request.headers.get("x-webhook-secret");
		const validSecret = secret === process.env.SANITY_WEBHOOK_SECRET;

		if (!validSecret) {
			return NextResponse.json(
				{ message: "Invalid webhook secret" },
				{ status: 401 }
			);
		}

		// Determine what type of content changed
		const { _type } = body;

		// Define paths to revalidate based on content type
		const pathsToRevalidate = ["/"];

		if (_type === "post") {
			// For blog posts revalidate the blog listings and sitemap
			pathsToRevalidate.push("/blogs");
			pathsToRevalidate.push("/sitemap.xml");
		}

		if (_type === "package") {
			// For packages revalidate the package listings and sitemap
			pathsToRevalidate.push("/packages");
			pathsToRevalidate.push("/sitemap.xml");
		}

		// Revalidate all necessary paths
		for (const path of pathsToRevalidate) {
			revalidatePath(path);
		}

		return NextResponse.json({
			revalidated: true,
			message: `Revalidated paths: ${pathsToRevalidate.join(", ")}`,
		});
	} catch (error) {
		console.error("Error revalidating paths:", error);
		return NextResponse.json(
			{ message: "Error revalidating paths", error: (error as Error).message },
			{ status: 500 }
		);
	}
}
