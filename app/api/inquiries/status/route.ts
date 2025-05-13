import { type NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { inquiryStatusUpdateSchema } from "@/lib/types";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { withErrorHandler, withAdminAuth } from "@/middleware/error-handler";

// POST update inquiry status
export async function POST(req: NextRequest) {
	return withErrorHandler(req, async (req) => {
		return withAdminAuth(req, async () => {
			const validatedData = inquiryStatusUpdateSchema.parse(await req.json());

			if (validatedData.ids.length === 0) {
				throw new ValidationError("No inquiry IDs provided");
			}

			await connectMongoDB();

			const result = await Inquiry.updateMany(
				{ _id: { $in: validatedData.ids } },
				{ $set: { status: validatedData.status } }
			);

			if (result.matchedCount === 0) {
				throw new NotFoundError("No inquiries found with the provided IDs");
			}

			return NextResponse.json({
				success: true,
				message: `Updated status to ${validatedData.status} for ${result.modifiedCount} inquiries`,
				modifiedCount: result.modifiedCount,
			});
		});
	});
}
