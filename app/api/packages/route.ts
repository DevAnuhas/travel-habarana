import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";
import { withAdminAuth, withErrorHandler } from "@/middleware/error-handler";

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

			const newPackage = await Package.create(packageItem.data);
			return NextResponse.json(newPackage, { status: 201 });
		});
	});
}
