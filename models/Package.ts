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
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Package ||
	mongoose.model("Package", packageSchema);
