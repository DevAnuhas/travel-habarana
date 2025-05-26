"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Eye,
	EyeSlash,
	Lock,
	CheckCircle,
	Info,
	CircleNotch,
	ArrowLeft,
} from "@phosphor-icons/react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import PasswordStrengthIndicator from "@/components/ui/password-strength-indicator";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [isLoading, setIsLoading] = useState(false);
	const [isVerifying, setIsVerifying] = useState(true);
	const [isValidToken, setIsValidToken] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const newPassword = form.watch("password");

	// Verify token on component mount
	useEffect(() => {
		async function verifyToken() {
			if (!token) {
				setIsVerifying(false);
				return;
			}

			try {
				const response = await fetch("/api/auth/verify-reset-token", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ token }),
				});

				const result = await response.json();

				if (result.success) {
					setIsValidToken(true);
					setUserEmail(result.email);
				} else {
					setIsValidToken(false);
					toast.error(result.message || "Invalid or expired reset token");
				}
			} catch {
				setIsValidToken(false);
				toast.error("Failed to verify reset token");
			} finally {
				setIsVerifying(false);
			}
		}

		verifyToken();
	}, [token]);

	async function onSubmit(data: ResetPasswordFormValues) {
		if (!token) return;

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password: data.password,
				}),
			});

			const result = await response.json();

			if (result.success) {
				setIsSuccess(true);
				toast.success("Password reset successfully!");

				// Auto-login the user
				setTimeout(async () => {
					const signInResult = await signIn("credentials", {
						email: userEmail,
						password: data.password,
						redirect: false,
					});

					if (signInResult?.ok) {
						toast.success("Welcome back! Redirecting to dashboard...");
						router.push("/admin/dashboard");
					} else {
						toast.info(
							"Password reset successful. Please login with your new password."
						);
						router.push("/admin/login");
					}
				}, 2000);
			} else {
				toast.error(result.message || "Failed to reset password");
			}
		} catch {
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	if (isVerifying) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center">
					<CircleNotch className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-muted-foreground">Verifying...</p>
				</div>
			</div>
		);
	}

	if (!token || !isValidToken) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
						<CardContent className="p-8 text-center">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Info className="h-8 w-8 text-red-600" />
							</div>
							<h1 className="text-2xl font-semibold mb-2">
								Invalid Reset Link
							</h1>
							<p className="text-muted-foreground mb-6">
								This password reset link is invalid or has expired. Please
								request a new one.
							</p>
							<Button
								onClick={() => router.push("/admin/login")}
								className="w-full"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Login
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="min-h-screen  flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
						<CardContent className="p-8 text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="h-8 w-8 text-green-600" />
							</div>
							<h1 className="text-2xl font-semibold mb-2">
								Password Reset Successful!
							</h1>
							<p className="text-muted-foreground mb-6">
								Your password has been reset successfully. You will be
								automatically logged in and redirected to the dashboard.
							</p>
							<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
								<CircleNotch className="h-4 w-4 animate-spin" />
								<span>Redirecting...</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Reset Password Card */}
				<div>
					<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl tracking-tight">
								Create New Password
							</CardTitle>
							<CardDescription>
								Enter a new password for {userEmail}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium">
													New Password
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
														<Input
															type={showPassword ? "text" : "password"}
															placeholder="Enter new password"
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
												{newPassword && (
													<PasswordStrengthIndicator password={newPassword} />
												)}
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium">
													Confirm Password
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
														<Input
															type={showConfirmPassword ? "text" : "password"}
															placeholder="Confirm new password"
															className="pl-10 pr-10 h-11"
															{...field}
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
															onClick={() =>
																setShowConfirmPassword(!showConfirmPassword)
															}
														>
															{showConfirmPassword ? (
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

									<div className="flex space-x-3">
										<Button
											type="button"
											variant="outline"
											onClick={() => router.push("/admin/login")}
											className="flex-1"
											disabled={isLoading}
										>
											<ArrowLeft className="mr-2 h-4 w-4" />
											Back to Login
										</Button>
										<Button
											type="submit"
											className="flex-1"
											disabled={isLoading}
										>
											{isLoading ? (
												<>
													<CircleNotch className="mr-1 h-4 w-4 animate-spin" />
													Resetting...
												</>
											) : (
												"Reset Password"
											)}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
