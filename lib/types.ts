import { z } from "zod";

// Package Schema
export const packageSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	duration: z.string().min(1, "Duration is required"),
	included: z
		.array(z.string())
		.min(1, "At least one included item is required"),
	images: z.array(z.string()).min(1, "At least one image is required"),
});

// Inquiry Schema
export const inquirySchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(5, "Phone number is required"),
	packageId: z.string().min(1, "Please select a package"),
	date: z.date({
		required_error: "Please select a date",
	}),
	numberOfPeople: z
		.number()
		.int()
		.min(1, { message: "Number of people is required" })
		.positive("Number of people must be positive"),
	specialRequests: z.string().optional(),
});

// User Schema
export const userSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" }),
	role: z.enum(["admin", "user"]).optional(),
});

// Admin Schema (for registration)
export const adminSchema = z
	.object({
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Confirm password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Password Change Schema
export const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(8, "New password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Confirm password must be at least 8 characters"),
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
