"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { passwordChangeSchema } from "@/lib/types";
import { toast } from "sonner";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import PasswordStrengthIndicator from "@/components/ui/password-strength-indicator";
import { Eye, EyeSlash, CircleNotch } from "@phosphor-icons/react";

type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

export default function ChangePasswordPage() {
	const { data: session } = useSession();
	const user = session?.user;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const newPassword = form.watch("newPassword");

	const onSubmit = async (data: PasswordFormValues) => {
		setIsSubmitting(true);

		try {
			const res = await fetch(`/api/auth/users/${user?.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
					confirmPassword: data.confirmPassword,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to change password");
			}

			toast.success("Password changed successfully");
			form.reset();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "An error occurred");
			} else {
				toast.error("An unexpected error occurred");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<div className="max-w-md mx-auto h-full flex flex-col justify-center">
				<SidebarTrigger className="absolute top-4 left-4 md:hidden" />
				<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Update Your Password</CardTitle>
						<CardDescription>
							Choose a strong password to protect your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Current Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showCurrentPassword ? "text" : "password"}
														placeholder="Enter your current password"
														className="pr-10 h-11"
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() =>
															setShowCurrentPassword(!showCurrentPassword)
														}
													>
														{showCurrentPassword ? (
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
								<FormField
									control={form.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showNewPassword ? "text" : "password"}
														placeholder="Create a strong new password"
														className="pr-10 h-11"
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() => setShowNewPassword(!showNewPassword)}
													>
														{showNewPassword ? (
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
											<FormLabel>Confirm New Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="Confirm your new password"
														className="pr-10 h-11"
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
								<Button
									type="submit"
									className="w-full"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<CircleNotch className="mr-1 h-4 w-4 animate-spin" />
											Updating Password...
										</>
									) : (
										<>Update Password</>
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
