import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";

// Get all packages
export async function GET() {
	await connectMongoDB();
	const data = await Package.find();
	return NextResponse.json(data, { status: 200 });
}

// Create a new package
export async function POST(request: Request) {
	const pkg = packageSchema.safeParse(await request.json());

	if (!pkg.success) {
		return NextResponse.json(pkg.error.issues, { status: 400 });
	}

	await connectMongoDB();

	const newPackage = new Package(pkg.data);

	await newPackage.save();
	return NextResponse.json(newPackage, { status: 201 });
}
