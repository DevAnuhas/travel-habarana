import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/modals/Inquiry";
import Package from "@/modals/Package";

export async function GET() {
	await connectMongoDB();
	Package.init();
	const data = await Inquiry.find()
		.populate("packageId", "name")
		.lean()
		.sort({ createdAt: -1 });
	return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
	const {
		name,
		email,
		phone,
		packageId,
		date,
		numberOfPeople,
		specialRequests,
	} = await request.json();

	await connectMongoDB();

	const newInquiry = new Inquiry({
		name,
		email,
		phone,
		packageId,
		date,
		numberOfPeople,
		specialRequests,
	});

	await newInquiry.save();
	return NextResponse.json(newInquiry, { status: 201 });
}
