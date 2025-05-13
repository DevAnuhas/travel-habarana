import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		phone: { type: String, required: true },
		packageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Package",
			required: true,
		},
		date: { type: Date, required: true },
		numberOfPeople: { type: Number, required: true },
		specialRequests: { type: String },
		status: {
			type: String,
			enum: ["new", "contacted", "confirmed", "cancelled"],
			default: "new",
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Inquiry ||
	mongoose.model("Inquiry", inquirySchema);
