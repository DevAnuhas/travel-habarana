import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Package from "@/models/Package";
import { inquirySchema } from "@/lib/types";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// Get all inquiries
export async function GET(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			await connectMongoDB();
			Package.init();
			const data = await Inquiry.find()
				.populate("packageId", "name")
				.lean()
				.sort({ createdAt: -1 });
			return NextResponse.json(data, { status: 200 });
		});
	});
}

// Create a new inquiry
export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		return withAdminAuth(request, async () => {
			const inquiry = inquirySchema.safeParse(await request.json());

			if (!inquiry.success) {
				return NextResponse.json(inquiry.error.issues, { status: 400 });
			}

			await connectMongoDB();

			const newInquiry = Inquiry.create(inquiry.data);
			return NextResponse.json(newInquiry, { status: 201 });
		});
	});
}
