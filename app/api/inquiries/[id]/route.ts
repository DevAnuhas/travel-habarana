import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Package from "@/models/Package";
import { inquiryUpdateSchema, objectIdSchema } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { parseJsonBody } from "@/lib/api";

// Get a inquiry by id
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const { id } = await params;
			objectIdSchema.parse(id);
			await connectMongoDB();
			Package.init();

			const inquiry = await Inquiry.findById(id).populate("packageId", "name");

			if (!inquiry) {
				throw new NotFoundError("Inquiry not found");
			}

			return NextResponse.json(inquiry, { status: 200 });
		});
	});
}

// Update a inquiry by id
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const { id } = await params;
			objectIdSchema.parse(id);
			const updatedInquiry = await parseJsonBody(
				request,
				inquiryUpdateSchema
			);

			await connectMongoDB();

			const inquiry = await Inquiry.findById(id);

			if (!inquiry) {
				throw new NotFoundError("Inquiry not found");
			}

			const savedInquiry = await Inquiry.findByIdAndUpdate(id, updatedInquiry, {
				returnDocument: "after",
				runValidators: true,
			});
			return NextResponse.json(savedInquiry, { status: 200 });
		});
	});
}

// Delete a inquiry by id
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const { id } = await params;
			objectIdSchema.parse(id);
			await connectMongoDB();

			const inquiry = await Inquiry.findById(id);

			if (!inquiry) {
				throw new NotFoundError("Inquiry not found");
			}

			await Inquiry.findByIdAndDelete(id);
			return NextResponse.json({ message: "Inquiry deleted successfully" });
		});
	});
}
