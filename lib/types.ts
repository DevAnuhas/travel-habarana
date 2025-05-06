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
