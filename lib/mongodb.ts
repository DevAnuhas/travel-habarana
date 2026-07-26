import mongoose from "mongoose";

// Store the connection promise globally to reuse it
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectMongoDB = async () => {
	// If already connected, return immediately
	if (mongoose.connection.readyState === 1) {
		return;
	}

	// If a connection is in progress, wait for it
	if (connectionPromise) {
		await connectionPromise;
		return;
	}

	try {
		// Start a new connection and store the promise
		const mongoUri = process.env.MONGODB_URI;
		if (!mongoUri) {
			throw new Error(
				"MONGODB_URI is not defined in the environment variables"
			);
		}

		connectionPromise = mongoose.connect(mongoUri, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
		});

		await connectionPromise;
	} catch (error) {
		throw error;
	} finally {
		// Reset the connection promise after it resolves or fails
		connectionPromise = null;
	}
};

export default connectMongoDB;
