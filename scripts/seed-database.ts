import mongoose from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import clearDatabase from "@/scripts/clear-database";
import User from "@/models/User";
import Package from "@/models/Package";

// Admin users
const adminUsers = [
	{
		email: "admin@travelhabarana.com",
		password: "password",
		role: "admin",
	},
];

// Tour packages
const travelPackages = [
	{
		name: "Hurulu Eco Park Safari",
		description:
			"Embark on a journey through one of Sri Lanka's hidden gems, the Hurulu Eco Park, nestled in the heart of the North Central Province. This safari offers an intimate encounter with Sri Lanka's iconic wildlife, particularly its majestic elephants, as they roam freely in their natural habitat. The park, part of the Hurulu Forest Reserve, is a UNESCO biosphere reserve and a critical corridor for elephant migration. During the dry season, from April to September, you can witness herds of elephants gathering around the Hurulu Wewa reservoir, creating a breathtaking spectacle. Beyond elephants, the park is home to elusive leopards, colorful jungle fowl, and graceful deer, making every moment a thrilling encounter with nature's wonders. A Hurulu Eco Park Safari promises an unforgettable adventure into Sri Lanka's wild soul.",
		duration: "3 hours",
		included: [
			"Luxury Jeep with Seatbelts",
			"Snack & Water",
			"Insurance Covered",
			"Expert Safari Guide",
		],
		images: [
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225632/2_rtl3uq.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225633/3_xjlaqo.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225634/1_ygtyx3.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225635/4_rxcvkk.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225638/4_efjvuc.png",
		],
	},
	{
		name: "Minneriya National Park Safari",
		description:
			"Experience the awe-inspiring spectacle of the world's largest gathering of wild Asian elephants at Minneriya National Park. From May to October, hundreds of elephants converge around the ancient Minneriya Tank, creating a breathtaking scene of grazing, bathing, and socializing. Set against a backdrop of lush grasslands and dense forests, this safari also offers sightings of deer, wild buffalo, and vibrant birdlife like eagles and storks. A Minneriya National Park Safari is a must for those seeking a profound connection with Sri Lanka's wildlife.",
		duration: "3 hours",
		included: [
			"Luxury Jeep with Seatbelts",
			"Snack & Water",
			"Insurance Covered",
			"Expert Safari Guide",
		],
		images: [
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225669/1_s6q0hr.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225671/2_qtoeer.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225671/5_ath87t.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225672/3_wwubly.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225673/6_j99a0y.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225673/7_h3mo1y.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225674/4_mkebqs.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225674/8_arm5zu.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225676/9_dwgi1c.jpg",
		],
	},
	{
		name: "Kaudulla National Park Safari",
		description:
			"Discover the serene beauty of Kaudulla National Park, a hidden gem in Sri Lanka's Cultural Triangle. This safari takes you through evergreen forests and grassy plains, where large herds of elephants gather around the Kaudulla Reservoir, particularly during the dry season. Beyond elephants, the park teems with sambar deer, wild boar, and rare birds like the grey-headed fish eagle. A Kaudulla National Park Safari offers a tranquil yet exhilarating escape into the heart of Sri Lanka's natural heritage.",
		duration: "3 hours",
		included: [
			"Luxury Jeep with Seatbelts",
			"Snack & Water",
			"Insurance Covered",
			"Expert Safari Guide",
		],
		images: [
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225653/1_icvmlo.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225657/2_i0j9uk.png",
		],
	},
	{
		name: "Village Experience Tour",
		description:
			"Immerse yourself in the vibrant traditions of Sri Lanka with a Cultural Village Tour. Begin with a serene boat ride, gliding through tranquil waterways surrounded by lush greenery. Savor a sumptuous lunch featuring nine traditional curries, including chicken and fresh lake fish, served with fragrant rice. Conclude your journey with tuk-tuk and tractor rides through the village, offering glimpses into local culture, crafts, and daily life. This tour is the perfect complement to your safari adventure. Wander through rural villages, where warm hospitality and ancient customs come alive. Engage with locals as you explore their daily lives. This tour unveils the rich heritage of Sri Lanka's rural heartland, offering a deep, personal connection to its culture and community.",
		duration: "3-4 hours",
		included: [
			"Traditional Lunch",
			"Boat Ride",
			"Tuk-Tuk Ride",
			"Village Guide",
			"Cooking Demonstration",
		],
		images: [
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225594/caption_dhlz1j.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225593/IMG_0515_fagere.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225593/IMG_0516_covn08.jpg",
			"https://res.cloudinary.com/travelhabarana/image/upload/v1747225596/IMG_0517_es31w0.jpg",
		],
	},

	{
		name: "Sri Lankan Culinary Journey",
		description:
			"Dive into the soul of Sri Lankan cuisine with our Sri Lankan Culinary Journey, a hands-on cooking class that brings the island's flavors to life. Under the guidance of local chefs, you'll master the art of preparing traditional dishes like fragrant rice and curry, using fresh spices such as cinnamon and cardamom. Set in a welcoming village environment, this experience blends culinary learning with cultural storytelling, culminating in a delicious meal you've crafted yourself. Perfect for food enthusiasts, this journey is a flavorful celebration of Sri Lanka's heritage.",
		duration: "3-4 hours",
		included: [
			"Hands-on Cooking Class",
			"Traditional Recipes",
			"Fresh Ingredients",
			"Local Chef Guide",
			"Cultural Insights",
		],
		images: [],
	},
];

async function seedDatabase() {
	try {
		await connectMongoDB();

		// Clear existing data
		await clearDatabase();

		console.log("🌱 Starting database seeding...");

		// Seed Admin Users
		console.log("👤 Seeding admin users...");
		let adminCount = 0;

		for (const adminData of adminUsers) {
			await User.create(adminData);
			console.log(`✅ Created admin user: ${adminData.email}`);
			adminCount++;
		}

		// Seed Travel Packages
		console.log("📦 Seeding travel packages...");
		let packageCount = 0;

		for (const packageData of travelPackages) {
			await Package.create(packageData);
			console.log(`✅ Created package: ${packageData.name}`);
			packageCount++;
		}

		// Summary
		console.log("\n🎉 Database seeding completed!");
		console.log(`\n📊 Summary:`);
		console.log(`   • Admin users created: ${adminCount}`);
		console.log(`   • Travel packages created: ${packageCount}`);

		// Display login credentials
		if (adminCount > 0) {
			console.log("\n🔐 Admin Login Credentials:");
			adminUsers.forEach((admin) => {
				console.log(`   Email: ${admin.email}`);
				console.log(`   Password: ${admin.password}\n`);
				console.log(`   ---`);
			});
		}
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	} finally {
		// Close connection properly
		try {
			await mongoose.connection.close();
			console.log("\n🔌 MongoDB Connection closed successfully");
			process.exit(0);
		} catch (error) {
			console.error("❌ Error closing database connection:", error);
			process.exit(1);
		}
	}
}

// Run the seeding function
seedDatabase();
