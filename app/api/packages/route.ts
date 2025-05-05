import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/modals/Package";

export async function GET() {
	await connectMongoDB();
	const data = await Package.find();
	return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
	const { name, description, duration, included, images } =
		await request.json();

	const newPackage = new Package({
		name,
		description,
		duration,
		included,
		images,
	});

	await newPackage.save();
	await connectMongoDB();
	return NextResponse.json(newPackage, { status: 201 });
}
