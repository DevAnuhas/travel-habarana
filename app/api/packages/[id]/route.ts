import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { generateSlug } from "@/utils/slug";

// Get a package by id or slug
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		const { id } = await params;
		await connectMongoDB();

		// Try to find by slug first (primary lookup method now)
		let packageItem = await Package.findOne({ slug: id });

		// Fall back to MongoDB _id only if necessary
		if (!packageItem && mongoose.Types.ObjectId.isValid(id)) {
			packageItem = await Package.findById(id);
		}

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

			let packageItem;
			if (mongoose.Types.ObjectId.isValid(id)) {
				packageItem = await Package.findById(id);
			} else {
				packageItem = await Package.findOne({ slug: id });
			}

			if (!packageItem) {
				throw new NotFoundError("Package not found");
			}

			// If name changed, update the slug too
			const packageData = { ...updatedPackage.data };

			if (packageData.name !== packageItem.name) {
				packageData.slug = generateSlug(packageData.name);

				const existingWithSlug = await Package.findOne({
					slug: packageData.slug,
					_id: { $ne: packageItem._id },
				});

				// If slug exists, add a timestamp suffix to make it unique
				if (existingWithSlug) {
					packageData.slug = `${packageData.slug}-${Date.now()
						.toString()
						.slice(-4)}`;
				}
			}

			await Package.findByIdAndUpdate(packageItem._id, packageData);
			return NextResponse.json(
				{ ...packageData, _id: packageItem._id },
				{ status: 201 }
			);
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

			let packageItem;

			if (mongoose.Types.ObjectId.isValid(id)) {
				packageItem = await Package.findByIdAndDelete(id);
			} else {
				packageItem = await Package.findOneAndDelete({ slug: id });
			}

			if (!packageItem) {
				throw new NotFoundError("Package not found");
			}

			return NextResponse.json({ success: true }, { status: 200 });
		});
	});
}
