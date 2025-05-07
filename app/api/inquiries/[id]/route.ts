import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Package from "@/models/Package";
import { inquirySchema } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// Get a inquiry by id
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const { id } = await params;
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
			const updatedInquiry = inquirySchema.safeParse(await request.json());

			if (!updatedInquiry.success) {
				return NextResponse.json(updatedInquiry.error.issues, { status: 400 });
			}

			await connectMongoDB();

			const inquiry = await Inquiry.findById(id);

			if (!inquiry) {
				throw new NotFoundError("Inquiry not found");
			}

			await Inquiry.findByIdAndUpdate(id, updatedInquiry.data);
			return NextResponse.json(updatedInquiry.data, { status: 201 });
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
