"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	EnvelopeSimple,
	ArrowLeft,
	CheckCircle,
	CircleNotch,
} from "@phosphor-icons/react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({
	open,
	onOpenChange,
}: ForgotPasswordModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [countdown, setCountdown] = useState(0);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (countdown > 0) {
			timer = setTimeout(() => {
				setCountdown(countdown - 1);
			}, 1000);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [countdown]);

	async function onSubmit(data: ForgotPasswordFormValues) {
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (result.success) {
				setIsSuccess(true);
				setCountdown(30); // Start 30-second countdown
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		} catch {
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	const handleClose = () => {
		onOpenChange(false);
		// Reset form and state when modal closes
		setTimeout(() => {
			setIsSuccess(false);
			form.reset();
		}, 200);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<div>
					<DialogHeader className="text-center">
						<DialogTitle className="text-xl font-semibold">
							{isSuccess ? "Check Your Email" : "Forgot Password?"}
						</DialogTitle>
						<DialogDescription className="text-base mb-4">
							{isSuccess &&
								"We've sent a password reset link to your email address."}
						</DialogDescription>
					</DialogHeader>

					{isSuccess ? (
						<div className="space-y-6">
							<div className="bg-white border rounded-lg p-4">
								<div className="flex items-center space-x-3">
									<CheckCircle className="h-8 w-8 text-green-600 mt-0.5" />
									<div className="text-sm w-fit">
										<p className="font-medium text-green-700">
											Email sent successfully!
										</p>
										<p className="mt-1">
											Please check your inbox and click the reset link. The link
											will expire in 1 hour.
										</p>
									</div>
								</div>
							</div>

							<div className="flex space-x-3">
								<Button
									variant="outline"
									onClick={() => setIsSuccess(false)}
									className="flex-1"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Send Another
								</Button>
								<Button onClick={handleClose} className="flex-1">
									Done
								</Button>
							</div>
						</div>
					) : (
						<div>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email Address</FormLabel>
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

									<div className="flex space-x-3">
										<Button
											type="button"
											variant="outline"
											onClick={handleClose}
											className="flex-1"
											disabled={isLoading}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											className="flex-1"
											disabled={isLoading || countdown > 0}
										>
											{isLoading ? (
												<>
													<CircleNotch className="mr-2 h-4 w-4 animate-spin" />
													Sending...
												</>
											) : countdown > 0 ? (
												`Wait ${countdown}s`
											) : (
												"Send Reset Link"
											)}
										</Button>
									</div>
								</form>
							</Form>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
