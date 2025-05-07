"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { login } from "./actions";
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

type LoginFormValues = z.infer<typeof userSchema>;

const LoginForm = () => {
	const router = useRouter();
	const navigate = router.push;
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (formData: LoginFormValues) => {
		setIsLoading(true);
		try {
			const data = new FormData();
			data.append("email", formData.email);
			data.append("password", formData.password);

			const response = await login(data);

			if (response.success) {
				navigate("/dashboard");
				console.log(response);

				toast.success(response.message, {
					description: response.description,
					duration: 5000,
				});
			} else {
				toast.error(response.message, {
					description: response.description,
				});
			}
		} catch {
			toast.error("Login failed", {
				description: "An unexpected error occurred. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl tracking-tight">Log in</CardTitle>
				<CardDescription>
					Enter your credentials to access the dashboard
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="email@example.com" {...field} />
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
										<Input
											type="password"
											placeholder="Enter your password"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							size={"lg"}
							className="w-full mt-2"
							disabled={isLoading}
						>
							{isLoading ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default LoginForm;
