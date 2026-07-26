import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Package from "@/models/Package";
import {
	idempotencyKeySchema,
	inquiryRequestSchema,
	objectIdSchema,
} from "@/lib/types";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";
import { siteConfig } from "@/config/site";
import { getClientAddress, parseJsonBody } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
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
			const packageIds = url.searchParams.getAll("packageId");
			const date = url.searchParams.get("date");
			const statuses = url.searchParams.getAll("status");
			const search = url.searchParams.get("search");
			const page = Math.max(
				1,
				Number.parseInt(url.searchParams.get("page") || "1") || 1
			);
			const pageSize = Math.min(
				100,
				Math.max(
					1,
					Number.parseInt(url.searchParams.get("pageSize") || "10") || 10
				)
			);

			// Build query based on filters
			const query: Record<string, unknown> = {};
			if (packageIds.length > 0) {
				query.packageId = {
					$in: packageIds.map((packageId) => objectIdSchema.parse(packageId)),
				};
			}
			if (date) {
				// Create start and end of the selected date to match all inquiries for that day
				const selectedDate = new Date(date);
				if (Number.isNaN(selectedDate.getTime())) {
					throw new ValidationError("Invalid date filter");
				}
				const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
				const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

				query.date = {
					$gte: startOfDay,
					$lte: endOfDay,
				};
			}
			if (statuses.length > 0) {
				query.status = { $in: statuses };
			}

			// Add search functionality
			if (search) {
				const safeSearch = search
					.trim()
					.slice(0, 100)
					.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				query.$or = [
					{ name: { $regex: safeSearch, $options: "i" } },
					{ email: { $regex: safeSearch, $options: "i" } },
					{ phone: { $regex: safeSearch, $options: "i" } },
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

			return NextResponse.json(
				{
					inquiries,
					pagination: {
						total,
						page,
						pageSize,
						pageCount: Math.ceil(total / pageSize),
					},
				},
				{ headers: { "Cache-Control": "private, no-store" } }
			);
		});
	});
}

// Create a new inquiry
export async function POST(request: NextRequest) {
	return withErrorHandler(request, async () => {
		const requestData = await parseJsonBody(request, inquiryRequestSchema);
		const idempotencyKey = idempotencyKeySchema.parse(
			request.headers.get("idempotency-key")
		);
		const clientAddress = getClientAddress(request.headers);

		await enforceRateLimit({
			scope: "public-inquiry",
			identifier: `${clientAddress}:${requestData.email}`,
			limit: 5,
			windowMs: 15 * 60 * 1000,
		});

		await connectMongoDB();

		const existingInquiry = await Inquiry.findOne({
			requestKey: idempotencyKey,
		});
		if (existingInquiry) {
			return NextResponse.json(
				{ newInquiry: existingInquiry, duplicate: true },
				{ status: 200 }
			);
		}

		const inquiryData = {
			name: requestData.name,
			email: requestData.email,
			phone: requestData.phone,
			packageId: requestData.packageId,
			date: requestData.date,
			numberOfPeople: requestData.numberOfPeople,
			specialRequests: requestData.specialRequests,
		};

		// Check if package exists
		const packageDetails = await Package.findById(inquiryData.packageId);
		if (!packageDetails) {
			throw new NotFoundError("Package not found");
		}

		let newInquiry;
		try {
			newInquiry = await Inquiry.create({
				...inquiryData,
				requestKey: idempotencyKey,
			});
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === 11000
			) {
				const duplicateInquiry = await Inquiry.findOne({
					requestKey: idempotencyKey,
				});
				if (duplicateInquiry) {
					return NextResponse.json(
						{ newInquiry: duplicateInquiry, duplicate: true },
						{ status: 200 }
					);
				}
			}

			throw error;
		}

		// Send email notification
		try {
			const transporter = getEmailTransporter();

			// Send notification to admin
			await transporter.sendMail({
				from: `"${siteConfig.name}" <no-reply@${
					new URL(siteConfig.url).hostname
				}>`,
				to: process.env.EMAIL_USER, // Admin email
				subject: `New Booking Inquiry: ${packageDetails.name}`,
				html: newInquiryAdminTemplate(newInquiry, packageDetails),
				replyTo: newInquiry.email, // Set reply-to as the customer's email
			});

			// Send confirmation to customer
			await transporter.sendMail({
				from: `"${siteConfig.name}" <no-reply@${
					new URL(siteConfig.url).hostname
				}>`,
				to: newInquiry.email,
				subject: `Your Booking Inquiry - ${siteConfig.name}`,
				html: newInquiryCustomerTemplate(newInquiry, packageDetails),
				replyTo: siteConfig.contact.email, // Set reply-to as the contact email
			});
		} catch (error) {
			console.error("Failed to send email:", error);
		}

		const safeInquiry = newInquiry.toObject();
		delete safeInquiry.requestKey;
		return NextResponse.json({ newInquiry: safeInquiry }, { status: 201 });
	});
}
