import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// Get a package by id
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		const { id } = await params;
		await connectMongoDB();

		const packageItem = await Package.findById(id);

		if (!packageItem) {
			throw new NotFoundError("Package not found");
		}

		return NextResponse.json(packageItem, { status: 200 });
	});
}

// Update a package by id
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const { id } = await params;
			const updatedPackage = packageSchema.safeParse(await request.json());

			if (!updatedPackage.success) {
				return NextResponse.json(updatedPackage.error.issues, { status: 400 });
			}

			await connectMongoDB();

			const packageItem = await Package.findById(id);

			if (!packageItem) {
				throw new NotFoundError("Package not found");
			}

			await Package.findByIdAndUpdate(id, updatedPackage.data);
			return NextResponse.json(updatedPackage.data, { status: 201 });
		});
	});
}

// Delete a package by id
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const { id } = await params;
			await connectMongoDB();

			const packageItem = await Package.findById(id);

			if (!packageItem) {
				throw new NotFoundError("Package not found");
			}

			await Package.findByIdAndDelete(id);
			return NextResponse.json({ message: "Package deleted successfully" });
		});
	});
}
