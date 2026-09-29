import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";
import { withAdminAuth, withErrorHandler } from "@/middleware/error-handler";
import { findAvailableSlug } from "@/lib/package-slug-store";
import { revalidatePackages } from "@/lib/package-revalidation";
import { parseJsonBody } from "@/lib/api";

// Get all packages
export async function GET(request: NextRequest) {
	return withErrorHandler(request, async () => {
		await connectMongoDB();
		const packages = await Package.find({}).sort({ createdAt: -1 }).lean();
		return NextResponse.json(packages, {
			status: 200,
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
			},
		});
	});
}

// Create a new package
export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const packageItem = await parseJsonBody(request, packageSchema, 64_000);

			await connectMongoDB();

			const packageWithSlug = {
				...packageItem,
				slug: await findAvailableSlug(packageItem.name),
			};

			const newPackage = await Package.create(packageWithSlug);
			revalidatePackages(newPackage.slug);
			return NextResponse.json(newPackage, { status: 201 });
		});
	});
}
