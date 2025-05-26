"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userSchema } from "@/lib/types";
import {
	EnvelopeSimple,
	Lock,
	Eye,
	EyeSlash,
	CircleNotch,
} from "@phosphor-icons/react";

type LoginFormValues = z.infer<typeof userSchema>;

const LoginForm = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(formData: LoginFormValues) {
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
			});

			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Logged in successfully");
			router.push("/admin/dashboard");
			router.refresh();
		} catch {
			toast.error("An error occurred during login");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-2xl tracking-tight">Welcome Back</CardTitle>
				<CardDescription>
					Sign in to access your admin dashboard
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<div className="relative">
											<EnvelopeSimple className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Enter your email"
												className="pl-10 h-11"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												type={showPassword ? "text" : "password"}
												placeholder="Enter your password"
												className="pl-10 pr-10 h-11"
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeSlash className="h-4 w-4 text-muted-foreground" />
												) : (
													<Eye className="h-4 w-4 text-muted-foreground" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-center justify-between">
							<div className="text-sm">
								<Button
									type="button"
									variant="link"
									className="p-0 h-auto"
									onClick={() => {
										// TODO: Implement forgot password
										toast.info("Password reset feature coming soon!");
									}}
								>
									Forgot your password?
								</Button>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<CircleNotch className="mr-1 h-4 w-4 animate-spin" />
									Logging in...
								</>
							) : (
								<>Login</>
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default LoginForm;
