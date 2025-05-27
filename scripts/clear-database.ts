import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import Package from "@/models/Package";
import Inquiry from "@/models/Inquiry";
import PasswordResetToken from "@/models/PasswordResetToken";

export default async function clearDatabase() {
	try {
		await connectMongoDB();
		console.log("🗑️ Starting database cleanup...");

		// Get counts before deletion
		const userCount = await User.countDocuments();
		const packageCount = await Package.countDocuments();
		const inquiryCount = await Inquiry.countDocuments();
		const tokenCount = await PasswordResetToken.countDocuments();

		console.log("\n📊 Current database state:");
		console.log(`   • Users: ${userCount}`);
		console.log(`   • Packages: ${packageCount}`);
		console.log(`   • Inquiries: ${inquiryCount}`);
		console.log(`   • Reset Tokens: ${tokenCount}`);

		// Ask for confirmation (in a real scenario, you might want to add a CLI prompt)
		console.log("\n⚠️  WARNING: This will delete ALL data from the database!");

		// Clear all collections
		await User.deleteMany({});
		await Package.deleteMany({});
		await Inquiry.deleteMany({});
		await PasswordResetToken.deleteMany({});

		console.log("\n✅ Database cleared successfully!");
	} catch (error) {
		console.error("❌ Error clearing database:", error);
		process.exit(1);
	}
}
