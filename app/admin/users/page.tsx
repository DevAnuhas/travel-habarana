"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import LoadingSpinner from "@/components/ui/spinner";
import { Plus, Trash2, User } from "lucide-react";

// Schema for admin registration
const adminSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(8, "Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type AdminFormValues = z.infer<typeof adminSchema>;

type Admin = {
	_id: string;
	email: string;
	role: string;
	createdAt: string;
};

export default function AdminsPage() {
	const { data: session } = useSession() || { data: null };
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const form = useForm<AdminFormValues>({
		resolver: zodResolver(adminSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		fetchAdmins();
	}, []);

	const fetchAdmins = async () => {
		try {
			setIsLoading(true);
			const res = await fetch("/api/auth/users");
			const data = await res.json();
			setAdmins(data);
		} catch {
			toast.error("Failed to load admin users");
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: AdminFormValues) => {
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: data.email,
					password: data.password,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to create admin user");
			}

			toast.success("Admin user created successfully");
			setIsDialogOpen(false);
			form.reset();
			fetchAdmins();
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

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this admin user?")) {
			return;
		}

		try {
			const res = await fetch(`/api/auth/users/${id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to delete admin user");
			}

			toast.success("Admin user deleted successfully");
			fetchAdmins();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "An error occurred");
			} else {
				toast.error("An unexpected error occurred");
			}
		}
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Admin Users</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Add Admin
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Add New Admin</DialogTitle>
								<DialogDescription>
									Create a new admin user with access to the admin panel.
								</DialogDescription>
							</DialogHeader>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														placeholder="admin@travelhabarana.com"
														{...field}
													/>
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
												<FormLabel>Confirm Password</FormLabel>
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
									<DialogFooter>
										<Button type="submit" disabled={isSubmitting}>
											{isSubmitting ? "Creating..." : "Create Admin"}
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<LoadingSpinner />
					</div>
				) : admins.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center h-64">
							<p className="text-muted-foreground mb-4">No admin users found</p>
							<Button onClick={() => setIsDialogOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Admin
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{admins.map((admin) => (
							<Card key={admin._id}>
								<CardContent className="flex justify-between items-center p-6">
									<div className="flex items-center">
										<div className="bg-primary/10 p-2 rounded-full mr-4">
											<User className="h-6 w-6 text-primary" />
										</div>
										<div>
											<h3 className="text-md">{admin.email}</h3>
											<p className="text-sm text-muted-foreground">
												Role: {admin.role}
											</p>
										</div>
									</div>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDelete(admin._id)}
										disabled={
											session?.user &&
											(session.user as { id?: string }).id === admin._id
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
