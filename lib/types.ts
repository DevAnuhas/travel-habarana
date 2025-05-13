import { z } from "zod";

// Package Schema
export const packageSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	duration: z.string().min(1, "Duration is required"),
	included: z.array(z.string()),
	images: z.array(z.string()),
});

// Inquiry Schema
export const inquirySchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(5, "Phone number is required"),
	packageId: z.string().min(1, "Package ID is required"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	numberOfPeople: z
		.number()
		.int()
		.positive("Number of people must be positive"),
	specialRequests: z.string().optional(),
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

// Inquiry Status Update Schema
export const inquiryStatusUpdateSchema = z.object({
	ids: z.array(z.string()),
	status: z.enum(["new", "contacted", "confirmed", "cancelled"]),
});
