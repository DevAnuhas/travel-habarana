import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/modals/Inquiry";
import Package from "@/modals/Package";

export async function GET(
	request: NextRequest,
	context: { params: { id: string } }
) {
	const { id } = await Promise.resolve(context.params);
	await connectMongoDB();
	Package.init();
	const data = await Inquiry.findById(id).populate("packageId", "name").lean();
	return NextResponse.json(data, { status: 200 });
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = await Promise.resolve(params);
	const updatedInquiry = await request.json();
	await Inquiry.findByIdAndUpdate(id, updatedInquiry);
	return NextResponse.json(updatedInquiry, { status: 201 });
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = await Promise.resolve(params);
	await Inquiry.findByIdAndDelete(id);
	return new NextResponse(null, { status: 204 });
}
