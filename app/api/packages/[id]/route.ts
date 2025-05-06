import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { packageSchema } from "@/lib/types";

// Get a package by id
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	await connectMongoDB();

	const pkg = await Package.findById(id);

	if (!pkg) {
		return new NextResponse(null, { status: 404 });
	}

	return NextResponse.json(pkg, { status: 200 });
}

// Update a package by id
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const updatedPackage = packageSchema.safeParse(await request.json());

	if (!updatedPackage.success) {
		return NextResponse.json(updatedPackage.error.issues, { status: 400 });
	}

	await connectMongoDB();

	const pkg = await Package.findById(id);

	if (!pkg) {
		return new NextResponse(null, { status: 404 });
	}

	await Package.findByIdAndUpdate(id, updatedPackage.data);
	return NextResponse.json(updatedPackage.data, { status: 201 });
}

// Delete a package by id
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	await connectMongoDB();

	const pkg = await Package.findById(id);

	if (!pkg) {
		return new NextResponse(null, { status: 404 });
	}

	await Package.findByIdAndDelete(id);
	return new NextResponse(null, { status: 204 });
}
