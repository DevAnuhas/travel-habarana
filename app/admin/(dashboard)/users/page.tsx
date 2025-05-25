"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { adminSchema } from "@/lib/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
	UserPlus,
	MagnifyingGlass,
	DotsThreeOutline,
	Shield,
	ShieldWarning,
	UserCheck,
	WarningCircle,
	EnvelopeOpen,
	Key,
	CalendarBlank,
	Trash,
	PencilSimpleLine,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/components/ui/spinner";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface User {
	_id: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
}

type AdminFormValues = z.infer<typeof adminSchema>;

export default function AdminUsersPage() {
	const { data: session } = useSession() || { data: null };
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const form = useForm<AdminFormValues>({
		resolver: zodResolver(adminSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	// Fetch users
	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/auth/users");
			if (!response.ok) throw new Error("Failed to fetch users");
			const data = await response.json();
			setUsers(data);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users. Please try again.");
			setIsLoading(false);
		}
	};

	// Initial fetch
	useEffect(() => {
		fetchUsers();
	}, []);

	// Apply filters and search
	useEffect(() => {
		let result = [...users];

		// Apply search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter((user) =>
				user.email.toLowerCase().includes(query)
			);
		}

		setFilteredUsers(result);
	}, [users, searchQuery]);

	// Handle user form submission
	const onSubmit = async (data: AdminFormValues) => {
		try {
			setIsSubmitting(true);
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: data.email,
					password: data.password,
					role: "admin",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create user");
			}

			toast.success("User created successfully");
			form.reset();
			setIsAddUserDialogOpen(false);
			fetchUsers();
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

	// Handle delete user
	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		try {
			setIsSubmitting(true);

			const response = await fetch(`/api/auth/users/${selectedUser._id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete user");
			}

			toast.success("User deleted successfully");
			setIsDeleteDialogOpen(false);
			setSelectedUser(null);
			fetchUsers();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "Failed to delete user");
			} else {
				toast.error("An unexpected error occurred");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Get role badge
	const getRoleBadge = (role: string) => {
		switch (role) {
			case "superadmin":
				return (
					<Badge variant="destructive" className="flex items-center gap-1">
						<ShieldWarning className="h-3 w-3" /> Super Admin
					</Badge>
				);
			case "admin":
				return (
					<Badge variant="default" className="flex items-center gap-1">
						<Shield className="h-3 w-3" /> Admin
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="flex items-center gap-1">
						<UserCheck className="h-3 w-3" /> {role}
					</Badge>
				);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex gap-2">
				<SidebarTrigger className="md:hidden" />
				<div className="flex justify-between items-center w-full">
					<h1 className="text-3xl font-bold">User Management</h1>
					<Button
						onClick={() => setIsAddUserDialogOpen(true)}
						className="flex items-center gap-2"
					>
						<UserPlus className="h-4 w-4" />
						Add New User
					</Button>
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
					<div className="relative w-full md:w-[300px]">
						<MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by email..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<LoadingSpinner />
				</div>
			) : (
				<>
					{filteredUsers.length === 0 ? (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-10 text-center">
								<WarningCircle className="h-10 w-10 text-muted-foreground mb-4" />
								<CardTitle className="text-xl mb-2">No users found</CardTitle>
								<CardDescription className="mb-6">
									{searchQuery !== "all"
										? "Try adjusting your search"
										: "Start by adding a new admin user"}
								</CardDescription>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredUsers.map((user) => (
								<div key={user._id}>
									<Card className="overflow-hidden">
										<CardHeader className="pb-2">
											<div className="flex justify-between items-start">
												<div className="space-y-1">
													<CardTitle className="text-base font-medium">
														{user.email}
													</CardTitle>
													<CardDescription>
														{getRoleBadge(user.role)}
													</CardDescription>
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															disabled={
																session?.user &&
																(session.user as { id?: string }).id ===
																	user._id
															}
														>
															<DotsThreeOutline
																className="h-4 w-4"
																weight="fill"
															/>
															<span className="sr-only">Open menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem className="cursor-pointer">
															<EnvelopeOpen className="mr-2 h-4 w-4 focus:text-background" />
															<span>Send Reset Link</span>
														</DropdownMenuItem>
														<DropdownMenuItem className="cursor-pointer">
															<PencilSimpleLine className="mr-2 h-4 w-4 focus:text-background" />
															<span>Edit User</span>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="cursor-pointer text-destructive focus:text-background"
															onClick={() => {
																setSelectedUser(user);
																setIsDeleteDialogOpen(true);
															}}
														>
															<Trash className="mr-2 h-4 w-4 text-destructive focus:text-background" />
															<span>Delete User</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardHeader>
										<CardContent className="pb-2">
											<div className="space-y-2 text-sm">
												<div className="flex items-center text-muted-foreground">
													<CalendarBlank className="h-3.5 w-3.5 mr-2" />
													<span>Created: {formatDate(user.createdAt)}</span>
												</div>
												<div className="flex items-center text-muted-foreground">
													<Key className="h-3.5 w-3.5 mr-2" />
													<span>
														Last updated: {formatDate(user.updatedAt)}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							))}
						</div>
					)}
				</>
			)}

			{/* Add User Dialog */}
			<Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add New Admin User</DialogTitle>
						<DialogDescription>
							Create a new user with admin access to the dashboard.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="admin@example.com" {...field} />
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
							<DialogFooter className="!justify-between mt-6">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsAddUserDialogOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Creating..." : "Create User"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete User Confirmation */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the user{" "}
							<span className="font-medium">{selectedUser?.email}</span>. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDeleteUser();
							}}
							disabled={isSubmitting}
							className="bg-destructive text-background hover:bg-destructive/90"
						>
							{isSubmitting ? "Deleting..." : "Delete User"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
