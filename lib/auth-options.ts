import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { userSchema } from "@/lib/types";
import connectMongoDB from "@/lib/mongodb";

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
			async authorize(credentials) {
				try {
					const result = userSchema.safeParse(credentials);
					if (!result.success) {
						throw new Error("Invalid input");
					}

					await connectMongoDB();

					const user = await User.findOne({ email: credentials?.email });
					if (!user) {
						throw new Error("Invalid credentials, please try again");
					}

					const passwordMatch = await bcrypt.compare(
						credentials?.password || "",
						user.password
					);
					if (!passwordMatch) {
						throw new Error("Invalid credentials, please try again");
					}

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
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/admin/login",
	},
};
