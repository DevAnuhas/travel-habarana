import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import LoginForm from "./login-form";
import { redirect } from "next/navigation";

const LoginPage = async () => {
	const session = await getServerSession(authOptions);

	if (session) redirect("/dashboard");

	return (
		<div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm space-y-6 animate-in fade-in duration-400">
				<div className="text-center">
					<h1 className="text-4xl gradient-text">Travel Habarana</h1>
					<p className="mt-2 text-lg text-muted-foreground">
						Sign in to your admin account
					</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
};

export default LoginPage;
