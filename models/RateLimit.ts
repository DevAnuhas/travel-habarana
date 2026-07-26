import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema(
	{
		key: { type: String, required: true, unique: true, index: true },
		count: { type: Number, required: true, default: 0 },
		resetAt: { type: Date, required: true },
	},
	{
		timestamps: true,
	}
);

rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit ||
	mongoose.model("RateLimit", rateLimitSchema);
