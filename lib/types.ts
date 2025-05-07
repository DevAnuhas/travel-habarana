import { z } from "zod";

// Package Schema
export const packageSchema = z.object({
	name: z.string(),
	description: z.string(),
	duration: z.string(),
	included: z.array(z.string()),
	images: z.array(z.string()),
});

// Inquiry Schema
export const inquirySchema = z.object({
	name: z.string(),
	email: z.string().email(),
	phone: z.string(),
	packageId: z.string(),
	date: z.string(),
	numberOfPeople: z.number(),
	specialRequests: z.string(),
});

// User Schema
export const userSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
	role: z.enum(["admin", "user"]).optional(),
});

// Password Change Schema
export const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(6, "New password must be at least 6 characters"),
		confirmPassword: z
			.string()
			.min(6, "Confirm password must be at least 6 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
