import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Package from "@/models/Package";
import { inquirySchema } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import {
	getEmailTransporter,
	newInquiryAdminTemplate,
	newInquiryCustomerTemplate,
} from "@/lib/email-service";

export async function GET(req: NextRequest) {
	return withErrorHandler(req, async (req) => {
		return withAdminAuth(req, async () => {
			await connectMongoDB();

			const url = new URL(req.url);
			const packageId = url.searchParams.get("packageId");
			const date = url.searchParams.get("date");
			const status = url.searchParams.get("status");
			const search = url.searchParams.get("search");
			const page = Number.parseInt(url.searchParams.get("page") || "1");
			const pageSize = Number.parseInt(
				url.searchParams.get("pageSize") || "10"
			);

			// Build query based on filters
			const query: Record<string, unknown> = {};
			if (packageId) query["packageId._id"] = packageId;
			if (date) query.date = date;
			if (status) query.status = status;

			// Add search functionality
			if (search) {
				query.$or = [
					{ name: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
					{ phone: { $regex: search, $options: "i" } },
				];
			}

			// Get total count for pagination
			const total = await Inquiry.countDocuments(query);

			// Get inquiries with pagination and sorting
			const inquiries = await Inquiry.find(query)
				.populate("packageId", "name")
				.sort({ createdAt: -1 })
				.skip((page - 1) * pageSize)
				.limit(pageSize);

			return NextResponse.json({
				inquiries,
				pagination: {
					total,
					page,
					pageSize,
					pageCount: Math.ceil(total / pageSize),
				},
			});
		});
	});
}

// Create a new inquiry
export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		const requestData = await request.json();

		// Parse the date string to a Date object
		if (requestData.date) {
			requestData.date = new Date(requestData.date);
		}

		const inquiry = inquirySchema.safeParse(requestData);

		if (!inquiry.success) {
			return NextResponse.json(inquiry.error.issues, { status: 400 });
		}

		await connectMongoDB();

		// Check if package exists
		const packageDetails = await Package.findById(inquiry.data.packageId);
		if (!packageDetails) {
			throw new NotFoundError("Package not found");
		}

		const newInquiry = await Inquiry.create(inquiry.data);

		// Send email notification
		try {
			const transporter = getEmailTransporter();

			// Send notification to admin
			await transporter.sendMail({
				from: `"Travel Habarana Booking" <${process.env.EMAIL_USER}>`,
				to: process.env.EMAIL_USER, // Admin email
				subject: `New Booking Inquiry: ${packageDetails.name}`,
				html: newInquiryAdminTemplate(newInquiry, packageDetails),
				replyTo: newInquiry.email, // Set reply-to as the customer's email
			});

			// Send confirmation to customer
			await transporter.sendMail({
				from: `"Travel Habarana" <${process.env.EMAIL_USER}>`,
				to: newInquiry.email,
				subject: "Your Booking Inquiry - Travel Habarana",
				html: newInquiryCustomerTemplate(newInquiry, packageDetails),
			});
		} catch (error) {
			console.error("Failed to send email:", error);
		}

		return NextResponse.json({ newInquiry, status: 201 });
	});
}
