import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
	try {
		const { _id, name, email, comment, imageUrl } = await request.json();

		// Create the comment document in Sanity
		// By default, comments are not approved (approved: false)
		await client.create({
			_type: "comment",
			post: {
				_type: "reference",
				_ref: _id,
			},
			name,
			email,
			comment,
			imageUrl,
			approved: false,
		});

		return NextResponse.json({
			message: "Comment submitted successfully",
			status: 201,
		});
	} catch (error) {
		console.error("Error submitting comment:", error);
		return NextResponse.json(
			{ message: "Could not submit comment", error: (error as Error).message },
			{ status: 500 }
		);
	}
}
