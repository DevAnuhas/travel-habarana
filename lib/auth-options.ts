import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { userSchema } from "@/lib/types";
import connectMongoDB from "@/lib/mongodb";
import { getClientAddress } from "@/lib/api";
import { clearRateLimit, enforceRateLimit } from "@/lib/rate-limit";

declare module "next-auth" {
	interface Session {
		user: {
			role: string;
			id: string;
		} & DefaultSession["user"];
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, request) {
				const email = credentials?.email?.trim().toLowerCase() ?? "";
				const clientAddress = getClientAddress(request.headers ?? {});
				const rateLimitIdentity = `${clientAddress}:${email}`;

				try {
					await enforceRateLimit({
						scope: "admin-login",
						identifier: rateLimitIdentity,
						limit: 5,
						windowMs: 15 * 60 * 1000,
					});

					const result = userSchema.safeParse(credentials);
					if (!result.success) {
						throw new Error("Invalid email or password");
					}

					await connectMongoDB();

					const user = await User.findOne({ email }).select("+password");
					if (!user) {
						throw new Error("Invalid email or password");
					}

					const passwordMatch = await bcrypt.compare(
						credentials?.password || "",
						user.password
					);
					if (!passwordMatch) {
						throw new Error("Invalid email or password");
					}

					if (user.role !== "admin") {
						throw new Error("Invalid email or password");
					}

					await clearRateLimit("admin-login", rateLimitIdentity);

					return {
						id: user._id.toString(),
						email: user.email,
						role: user.role,
					};
				} catch (error: unknown) {
					if (error instanceof Error) {
						throw new Error(error.message || "Authentication failed");
					} else {
						throw new Error("Authentication failed");
					}
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				if ("role" in user) {
					token.role = user.role;
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.role = token.role as string;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
		maxAge: 12 * 60 * 60,
	},
	jwt: {
		maxAge: 12 * 60 * 60,
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/admin/login",
	},
};
