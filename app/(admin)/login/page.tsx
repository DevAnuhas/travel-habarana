import LoginForm from "./login-form";

const LoginPage = async () => {
	return (
		<div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm space-y-6 animate-in fade-in duration-400">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight gradient-text">
						Travel Habarana
					</h1>
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
