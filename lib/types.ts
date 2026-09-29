import { z } from "zod";
import { isAcceptableSubmittedDate } from "./booking-dates";
import {
	PACKAGE_CATEGORIES,
	PRICE_CURRENCIES,
	PRICE_UNITS,
} from "./package-catalog";

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

const optionalText = (maximum: number) =>
	z.string().trim().max(maximum).nullable().optional();

const listOf = (maxItems: number, maxLength: number, label: string) =>
	z
		.array(trimmedString(1, maxLength, label))
		.max(maxItems)
		.nullable()
		.optional();

const monthSchema = z.number().int().min(1).max(12);

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
	// Optional merchandising fields. `null` lets the admin clear a value.
	category: z.enum(PACKAGE_CATEGORIES).nullable().optional(),
	sortOrder: z.number().int().min(0).max(999).nullable().optional(),
	priceFrom: z.number().positive().max(100_000).nullable().optional(),
	priceCurrency: z.enum(PRICE_CURRENCIES).nullable().optional(),
	priceUnit: z.enum(PRICE_UNITS).nullable().optional(),
	priceNote: z.string().trim().max(160).nullable().optional(),
	// Optional landing-page content. Rendered only when present.
	summary: optionalText(220),
	seoTitle: optionalText(70),
	seoDescription: optionalText(160),
	groupSize: optionalText(60),
	highlights: listOf(8, 140, "Highlight"),
	notIncluded: listOf(12, 140, "Not included item"),
	timeSlots: listOf(4, 40, "Time slot"),
	pickupAreas: listOf(10, 60, "Pickup area"),
	whatToBring: listOf(10, 100, "What to bring item"),
	// Keyed by image URL, not position, so gaps, reordering and removal can
	// never shift a description onto another photo.
	imageAlts: z
		.array(
			z.object({
				src: z.url("Each described image must be a valid URL"),
				alt: trimmedString(1, 150, "Image description"),
			})
		)
		.max(30)
		.nullable()
		.optional(),
	itinerary: z
		.array(
			z.object({
				time: optionalText(20),
				title: trimmedString(1, 100, "Itinerary step"),
				detail: optionalText(300),
			})
		)
		.max(10)
		.nullable()
		.optional(),
	faqs: z
		.array(
			z.object({
				question: trimmedString(5, 200, "Question"),
				answer: trimmedString(5, 1_000, "Answer"),
			})
		)
		.max(10)
		.nullable()
		.optional(),
	season: z
		.object({
			peak: z.array(monthSchema).max(12),
			good: z.array(monthSchema).max(12),
		})
		.nullable()
		.optional(),
}).superRefine((value, context) => {
	// Independent checks: no early return, or later checks would be skipped.
	if (value.priceFrom != null && !value.priceCurrency) {
		context.addIssue({
			code: "custom",
			path: ["priceCurrency"],
			message: "Choose a currency for the price",
		});
	}
	if (value.priceFrom != null && !value.priceUnit) {
		context.addIssue({
			code: "custom",
			path: ["priceUnit"],
			message: "Choose what the price covers",
		});
	}
	if (value.season) {
		const all = [...value.season.peak, ...value.season.good];
		if (new Set(all).size !== all.length) {
			context.addIssue({
				code: "custom",
				path: ["season"],
				message: "Each month can be marked once, as best or good",
			});
		}
	}
});

export type PackageInput = z.infer<typeof packageSchema>;

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
