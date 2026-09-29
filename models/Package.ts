import mongoose from "mongoose";
import {
	PACKAGE_CATEGORIES,
	PRICE_CURRENCIES,
	PRICE_UNITS,
} from "@/lib/package-catalog";

const packageSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		description: { type: String, required: true },
		duration: { type: String, required: true },
		included: { type: [String], required: true },
		images: { type: [String], default: [] },
		previousSlugs: { type: [String], default: [], index: true },
		// Optional merchandising fields. `null` is listed in each enum because
		// Mongoose's enum validator otherwise rejects a cleared value.
		category: {
			type: String,
			enum: [...PACKAGE_CATEGORIES, null],
			default: null,
		},
		sortOrder: { type: Number, default: null },
		priceFrom: { type: Number, default: null },
		priceCurrency: {
			type: String,
			enum: [...PRICE_CURRENCIES, null],
			default: null,
		},
		priceUnit: { type: String, enum: [...PRICE_UNITS, null], default: null },
		priceNote: { type: String, default: null },
		// Optional landing-page content (see lib/package-serialize.ts).
		summary: { type: String, default: null },
		seoTitle: { type: String, default: null },
		seoDescription: { type: String, default: null },
		groupSize: { type: String, default: null },
		highlights: { type: [String], default: undefined },
		notIncluded: { type: [String], default: undefined },
		timeSlots: { type: [String], default: undefined },
		pickupAreas: { type: [String], default: undefined },
		whatToBring: { type: [String], default: undefined },
		imageAlts: {
			type: [
				new mongoose.Schema(
					{
						src: { type: String, required: true },
						alt: { type: String, required: true },
					},
					{ _id: false }
				),
			],
			default: undefined,
		},
		itinerary: {
			type: [
				new mongoose.Schema(
					{
						time: String,
						title: { type: String, required: true },
						detail: String,
					},
					{ _id: false }
				),
			],
			default: undefined,
		},
		faqs: {
			type: [
				new mongoose.Schema(
					{
						question: { type: String, required: true },
						answer: { type: String, required: true },
					},
					{ _id: false }
				),
			],
			default: undefined,
		},
		season: {
			type: new mongoose.Schema(
				{ peak: [Number], good: [Number] },
				{ _id: false }
			),
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Package ||
	mongoose.model("Package", packageSchema);
