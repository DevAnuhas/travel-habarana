import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/modals/Inquiry";
import Package from "@/modals/Package";
import { inquirySchema } from "@/lib/types";

// Get a inquiry by id
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	await connectMongoDB();
	Package.init();

	const inquiry = await Inquiry.findById(id).populate("packageId", "name");

	if (!inquiry) {
		return new NextResponse(null, { status: 404 });
	}

	return NextResponse.json(inquiry, { status: 200 });
}

// Update a inquiry by id
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const updatedInquiry = inquirySchema.safeParse(await request.json());

	if (!updatedInquiry.success) {
		return NextResponse.json(updatedInquiry.error.issues, { status: 400 });
	}

	await connectMongoDB();

	const inquiry = await Inquiry.findById(id);

	if (!inquiry) {
		return new NextResponse(null, { status: 404 });
	}

	await Inquiry.findByIdAndUpdate(id, updatedInquiry.data);
	return NextResponse.json(updatedInquiry.data, { status: 201 });
}

// Delete a inquiry by id
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	await connectMongoDB();

	const inquiry = await Inquiry.findById(id);

	if (!inquiry) {
		return new NextResponse(null, { status: 404 });
	}

	await Inquiry.findByIdAndDelete(id);
	return new NextResponse(null, { status: 204 });
}
