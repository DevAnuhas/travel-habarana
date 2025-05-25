"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	UserPlus,
	MagnifyingGlass,
	DotsThreeOutline,
	Shield,
	ShieldWarning,
	UserCheck,
	UserMinus,
	EnvelopeOpen,
	Key,
	Calendar,
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface User {
	_id: string;
	email: string;
	role: string;
	createdAt: string;
	updatedAt: string;
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
	const [newUserEmail, setNewUserEmail] = useState("");
	const [newUserPassword, setNewUserPassword] = useState("");
	const [newUserRole, setNewUserRole] = useState("admin");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

	// Handle add user
	const handleAddUser = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newUserEmail || !newUserPassword) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			setIsSubmitting(true);

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: newUserEmail,
					password: newUserPassword,
					role: newUserRole,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create user");
			}

			toast.success("User created successfully");
			setNewUserEmail("");
			setNewUserPassword("");
			setNewUserRole("admin");
			setIsAddUserDialogOpen(false);
			fetchUsers();
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "Failed to create user");
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
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">User Management</h1>
					<p className="text-muted-foreground">
						Manage admin users and their access permissions
					</p>
				</div>
				<Button
					onClick={() => setIsAddUserDialogOpen(true)}
					className="flex items-center gap-2"
				>
					<UserPlus className="h-4 w-4" />
					Add New User
				</Button>
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
								<UserMinus className="h-10 w-10 text-muted-foreground mb-4" />
								<CardTitle className="text-xl mb-2">No users found</CardTitle>
								<CardDescription className="mb-6">
									{searchQuery !== "all"
										? "Try adjusting your search or filter criteria"
										: "Start by adding a new admin user"}
								</CardDescription>
								<Button onClick={() => setIsAddUserDialogOpen(true)}>
									<UserPlus className="h-4 w-4 mr-2" />
									Add New User
								</Button>
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
													<Calendar className="h-3.5 w-3.5 mr-2" />
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
					<form onSubmit={handleAddUser}>
						<Tabs defaultValue="basic" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="basic">Basic Info</TabsTrigger>
								<TabsTrigger value="permissions">Permissions</TabsTrigger>
							</TabsList>
							<TabsContent value="basic" className="space-y-4 pt-4">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="admin@example.com"
											value={newUserEmail}
											onChange={(e) => setNewUserEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											placeholder="Create a strong password"
											value={newUserPassword}
											onChange={(e) => setNewUserPassword(e.target.value)}
											required
										/>
										<p className="text-xs text-muted-foreground">
											Password must be at least 8 characters long.
										</p>
									</div>
								</div>
							</TabsContent>
							<TabsContent value="permissions" className="space-y-4 pt-4">
								<div className="space-y-2">
									<Label htmlFor="role">User Role</Label>
									<Select value={newUserRole} onValueChange={setNewUserRole}>
										<SelectTrigger>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground mt-1">
										{newUserRole === "superadmin"
											? "Super Admins have full access to all features including user management."
											: "Admins can manage content but cannot manage other users."}
									</p>
								</div>
							</TabsContent>
						</Tabs>
						<DialogFooter className="mt-6">
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
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isSubmitting ? "Deleting..." : "Delete User"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
