import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Define public paths that don't require authentication
	const isPublicPath =
		path === "/admin/login" || path === "/admin/reset-password";

	// Check if the path is an admin path
	const isAdminPath = path.startsWith("/admin");

	if (!isAdminPath) {
		return NextResponse.next();
	}

	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// Redirect to login if trying to access a protected admin route without being authenticated
	if (!isPublicPath && !token) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	// Redirect to dashboard if already logged in and trying to access login page
	if (isPublicPath && token) {
		return NextResponse.redirect(new URL("/admin/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*"],
};
