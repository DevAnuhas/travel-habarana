import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Package from "@/modals/Package";

export async function GET(
	request: Request,
	context: { params: { id: string } }
) {
	const { id } = await Promise.resolve(context.params);
	await connectMongoDB();
	const data = await Package.findById(id);
	return NextResponse.json(data, { status: 200 });
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = await Promise.resolve(params);
	const updatedPackage = await request.json();

	await Package.findByIdAndUpdate(id, updatedPackage);
	return NextResponse.json(updatedPackage, { status: 201 });
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = await Promise.resolve(params);

	await Package.findByIdAndDelete(id);
	return new NextResponse(null, { status: 204 });
}
