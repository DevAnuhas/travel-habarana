import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import LoginForm from "./login-form";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
	title: `Admin Login - ${siteConfig.name}`,
	description: `Login to the ${siteConfig.name} administration dashboard.`,
	robots: "noindex, nofollow",
};

const LoginPage = async () => {
	const session = await getServerSession(authOptions);

	if (session) redirect("/admin/dashboard");

	return (
		<div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
			<div className="w-full max-w-md space-y-6 animate-in fade-in duration-400">
				<div className="text-center">
					<h1 className="text-4xl gradient-text font-bold">
						{siteConfig.name}
					</h1>
					<p className="mt-2 text-lg text-muted-foreground">Admin Portal</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
};

export default LoginPage;
