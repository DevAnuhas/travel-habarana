import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";
import { withAdminAuth, withErrorHandler } from "@/middleware/error-handler";
import { generateSlug } from "@/utils/slug";
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

			// Generate slug from name
			let slug = generateSlug(packageItem.name);

			// Check if the slug already exists
			const existingWithSlug = await Package.findOne({ slug });

			// If slug exists, add a timestamp suffix to make it unique
			if (existingWithSlug) {
				slug = `${slug}-${Date.now().toString().slice(-4)}`;
			}

			const packageWithSlug = {
				...packageItem,
				slug,
			};

			const newPackage = await Package.create(packageWithSlug);
			revalidateTag("package", "max");
			revalidatePath("/packages");
			revalidatePath("/sitemap.xml");
			return NextResponse.json(newPackage, { status: 201 });
		});
	});
}
