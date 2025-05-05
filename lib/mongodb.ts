import mongoose from "mongoose";

const connectMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI || "");
		console.log("Connected to MongoDB");
	} catch (error) {
		console.error(error);
	}
};

export default connectMongoDB;
