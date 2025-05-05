import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		duration: { type: String, required: true },
		included: { type: [String], required: true },
		images: { type: [String], default: [] },
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Package ||
	mongoose.model("Package", packageSchema);
