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
import { AdminLayout } from "@/components/admin/layout";

type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

export default function ChangePasswordPage() {
	const { data: session } = useSession();
	const user = session?.user;
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

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
		<AdminLayout>
			<div className="max-w-md mx-auto">
				<h1 className="text-3xl font-bold mb-6">Change Password</h1>

				<Card>
					<CardHeader>
						<CardTitle>Update Your Password</CardTitle>
						<CardDescription>
							Enter your current password and a new password to update your
							credentials.
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
												<Input
													type="password"
													placeholder="••••••••"
													{...field}
												/>
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
												<Input
													type="password"
													placeholder="••••••••"
													{...field}
												/>
											</FormControl>
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
												<Input
													type="password"
													placeholder="••••••••"
													{...field}
												/>
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
									{isSubmitting ? "Updating..." : "Update Password"}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
