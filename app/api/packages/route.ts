import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";
import { withAdminAuth, withErrorHandler } from "@/middleware/error-handler";
import { generateSlug } from "@/utils/slug";

// Get all packages
export async function GET(request: NextRequest) {
	return withErrorHandler(request, async () => {
		await connectMongoDB();
		const packages = await Package.find({}).sort({ createdAt: -1 });
		return NextResponse.json(packages, { status: 200 });
	});
}

// Create a new package
export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const packageItem = packageSchema.safeParse(await request.json());

			if (!packageItem.success) {
				return NextResponse.json(packageItem.error.issues, { status: 400 });
			}

			await connectMongoDB();

			// Generate slug from name
			let slug = generateSlug(packageItem.data.name);

			// Check if the slug already exists
			const existingWithSlug = await Package.findOne({ slug });

			// If slug exists, add a timestamp suffix to make it unique
			if (existingWithSlug) {
				slug = `${slug}-${Date.now().toString().slice(-4)}`;
			}

			const packageWithSlug = {
				...packageItem.data,
				slug,
			};

			const newPackage = await Package.create(packageWithSlug);
			return NextResponse.json(newPackage, { status: 201 });
		});
	});
}
