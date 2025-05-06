"use server";

import { revalidatePath } from "next/cache";

export type LoginResponse = {
	success: boolean;
	message: string;
	description?: string;
};

export async function login(data: FormData): Promise<LoginResponse> {
	console.log(data);

	revalidatePath("/", "layout");
	return {
		success: true,
		message: "Login successful",
		description: "Welcome back!",
	};
}

export async function signOut() {
	revalidatePath("/", "layout");
}
