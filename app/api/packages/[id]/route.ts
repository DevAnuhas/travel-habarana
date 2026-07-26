import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import mongoose from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageIdentifierSchema, packageSchema } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { generateSlug } from "@/utils/slug";
import { parseJsonBody } from "@/lib/api";

// Get a package by id or slug
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		const { id } = await params;
		packageIdentifierSchema.parse(id);
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

		// Cache-Control header for better performance
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=86400"
		);

		return NextResponse.json(packageItem, {
			status: 200,
			headers,
		});
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
			packageIdentifierSchema.parse(id);
			const updatedPackage = await parseJsonBody(
				request,
				packageSchema,
				64_000
			);

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
			const packageData = { ...updatedPackage };

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

			const savedPackage = await Package.findByIdAndUpdate(
				packageItem._id,
				packageData,
				{ new: true, runValidators: true }
			);
			revalidateTag("package", "max");
			revalidatePath("/packages");
			revalidatePath(`/packages/${packageItem.slug}`);
			if (savedPackage?.slug && savedPackage.slug !== packageItem.slug) {
				revalidatePath(`/packages/${savedPackage.slug}`);
			}
			revalidatePath("/sitemap.xml");
			return NextResponse.json(savedPackage, { status: 200 });
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
			packageIdentifierSchema.parse(id);
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

			revalidateTag("package", "max");
			revalidatePath("/packages");
			revalidatePath(`/packages/${packageItem.slug}`);
			revalidatePath("/sitemap.xml");
			return NextResponse.json({ success: true }, { status: 200 });
		});
	});
}
