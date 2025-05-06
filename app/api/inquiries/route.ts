import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Package from "@/models/Package";
import { inquirySchema } from "@/lib/types";

// Get all inquiries
export async function GET() {
	await connectMongoDB();
	Package.init();
	const data = await Inquiry.find()
		.populate("packageId", "name")
		.lean()
		.sort({ createdAt: -1 });
	return NextResponse.json(data, { status: 200 });
}

// Create a new inquiry
export async function POST(request: Request) {
	const inquiry = inquirySchema.safeParse(await request.json());

	if (!inquiry.success) {
		return NextResponse.json(inquiry.error.issues, { status: 400 });
	}

	await connectMongoDB();

	const newInquiry = new Inquiry(inquiry.data);

	await newInquiry.save();
	return NextResponse.json(newInquiry, { status: 201 });
}
