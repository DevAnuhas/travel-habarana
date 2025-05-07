import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { userSchema } from "@/lib/types";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
	const user = userSchema.safeParse(await request.json());

	if (!user.success) {
		return new NextResponse(JSON.stringify(user.error.issues), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	const hashedPassword = await bcrypt.hash(user.data.password, 10);
	user.data.password = hashedPassword;

	await connectMongoDB();

	const newUser = new User(user.data);
	await newUser.save();

	return new NextResponse(null, {
		status: 201,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
