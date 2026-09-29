import { z } from "zod";
import { isAcceptableSubmittedDate } from "./booking-dates";

const trimmedString = (minimum: number, maximum: number, label: string) =>
	z
		.string()
		.trim()
		.min(minimum, `${label} must be at least ${minimum} characters`)
		.max(maximum, `${label} must be ${maximum} characters or fewer`);

export const objectIdSchema = z
	.string()
	.regex(/^[a-f\d]{24}$/i, "Invalid resource identifier");

export const packageIdentifierSchema = z
	.string()
	.trim()
	.min(1)
	.max(160)
	.refine(
		(value) =>
			/^[a-f\d]{24}$/i.test(value) ||
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
		"Invalid package identifier"
	);

export const passwordPolicySchema = z
	.string()
	.min(12, "Password must be at least 12 characters")
	.max(128, "Password must be 128 characters or fewer")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character"
	);

// Package Schema
export const packageSchema = z.object({
	name: trimmedString(3, 120, "Name"),
	slug: z
		.string()
		.trim()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")
		.max(160)
		.optional(),
	description: trimmedString(10, 10_000, "Description"),
	duration: trimmedString(1, 80, "Duration"),
	included: z
		.array(trimmedString(1, 200, "Included item"))
		.min(1, "At least one included item is required")
		.max(30, "No more than 30 included items are allowed"),
	images: z
		.array(z.url("Each image must be a valid URL"))
		.min(1, "At least one image is required")
		.max(30, "No more than 30 images are allowed"),
});

// Inquiry Schema
export const inquirySchema = z.object({
	name: trimmedString(2, 100, "Name"),
	email: z.email("Please enter a valid email address").trim().toLowerCase(),
	phone: z
		.string()
		.trim()
		.min(7, "Phone number is required")
		.max(30, "Phone number is too long")
		.regex(/^[+\d][\d\s().-]+$/, "Please enter a valid phone number"),
	packageId: z
		.string()
		.min(1, "Please select a package")
		.regex(/^[a-f\d]{24}$/i, "Please select a valid package"),
	date: z.date({ error: "Please select a date" }),
	numberOfPeople: z
		.number({ error: "Please enter the number of people" })
		.int()
		.min(1, { message: "Number of people is required" })
		.max(50, "Please contact us directly for groups larger than 50"),
	specialRequests: z.string().trim().max(1_000).optional(),
	website: z.string().max(0).optional(),
});

export const inquiryRequestSchema = inquirySchema
	.omit({ date: true })
	.extend({
		date: z.coerce
			.date({ error: "Please select a valid date" })
			.refine(
				(date) => isAcceptableSubmittedDate(date, new Date()),
				"Preferred date cannot be in the past"
			),
	});

export const inquiryUpdateSchema = inquirySchema
	.omit({ date: true, website: true })
	.extend({ date: z.coerce.date() });

export const idempotencyKeySchema = z.uuid("Invalid idempotency key");

// User Schema
export const userSchema = z.object({
	email: z.email("Please enter a valid email address").trim().toLowerCase(),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" })
		.max(128),
	role: z.enum(["admin", "user"]).optional(),
});

export const userCreateSchema = z.object({
	email: z.email("Please enter a valid email address").trim().toLowerCase(),
	password: passwordPolicySchema,
	role: z.enum(["admin", "user"]).default("user"),
});

// Admin Schema (for registration)
export const adminSchema = z
	.object({
		email: z.email("Please enter a valid email address").trim().toLowerCase(),
		password: passwordPolicySchema,
		confirmPassword: z
			.string()
			.min(12, "Confirm password must be at least 12 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Password Change Schema
export const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: passwordPolicySchema,
		confirmPassword: z
			.string()
			.min(12, "Confirm password must be at least 12 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Inquiry Status Update Schema
export const inquiryStatusUpdateSchema = z.object({
	ids: z.array(objectIdSchema).min(1).max(100),
	status: z.enum(["new", "contacted", "confirmed", "cancelled"]),
});

export const commentRequestSchema = z.object({
	_id: z.string().trim().min(1).max(200),
	name: trimmedString(2, 80, "Name"),
	comment: trimmedString(3, 2_000, "Comment"),
	website: z.string().max(0).optional(),
});
