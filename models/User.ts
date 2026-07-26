import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true, select: false },
		role: { type: String, enum: ["admin", "user"], default: "user" },
	},
	{
		timestamps: true,
	}
);

// Add method to compare passwords
userSchema.methods.comparePassword = async function (
	candidatePassword: string
) {
	return bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving
userSchema.pre("save", async function () {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
	}
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
