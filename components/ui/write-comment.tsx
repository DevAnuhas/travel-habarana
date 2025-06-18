"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";

interface FormInput {
	_id: string;
	name: string;
	email: string;
	comment: string;
}
const WriteComment = ({ _id }: { _id: string }) => {
	const { data: session } = useSession();
	const [submitted, setSubmitted] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInput>();

	const onSubmit: SubmitHandler<FormInput> = async (data) => {
		const userImage = session?.user?.image || "";

		try {
			const response = await fetch("/api/create-comment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					imageUrl: userImage,
				}),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			setSubmitted(true);
		} catch (error) {
			console.error("Create comment error", error);
		}
	};

	return (
		<div className="py-16">
			{submitted ? (
				<div className="flex items-center justify-center">
					<div className="w-full max-w-2xl px-6 py-8 rounded-lg border">
						<div className="flex flex-col items-center space-y-4">
							<CheckCircle className="w-16 h-16 text-green-600" />
							<h1 className="text-3xl font-bold text-center">
								Thank you for submitting your comment!
							</h1>
							<p className="text-lg text-center">
								Once it has been approved by our admin, it will appear below.
							</p>
							<div className="mt-4 text-sm text-gray-400">
								We appreciate your patience and value your contribution.
							</div>
						</div>
					</div>
				</div>
			) : (
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col max-w-2xl mx-auto"
				>
					<h3 className="text-xl text-primary font-bold mb-2">
						Enjoyed this article?
					</h3>
					<h4 className="text-3xl font-bold">Leave a Comment below!</h4>
					<hr className="py-3 mt-2" />
					<input {...register("_id")} type="hidden" name="_id" value={_id} />
					<div className="flex flex-col gap-1 mb-2">
						<label className="text-gray-700 font-medium">Name</label>
						<input
							disabled={!session?.user}
							{...register("name", { required: true })}
							type="text"
							placeholder="Enter your name"
							className="w-full px-4 py-2 text-gray-700 bg-white border-2 outline-none focus:border-blue-600 rounded-md"
						/>
					</div>
					<div className="flex flex-col gap-1 mb-2">
						<label className="text-gray-700 font-medium">Email</label>
						<input
							disabled={!session?.user}
							{...register("email", { required: true })}
							type="email"
							placeholder="Provide a valid email"
							className="w-full px-4 py-2 text-gray-700 bg-white border-2 outline-none focus:border-blue-600 rounded-md"
						/>
					</div>
					<div className="flex flex-col gap-1 mb-2">
						<label className="text-gray-700 font-medium">Comment</label>
						<textarea
							disabled={!session?.user}
							{...register("comment", { required: true })}
							placeholder="Type your comments..."
							className="w-full px-4 py-2 text-gray-700 bg-white border-2 outline-none focus:border-blue-600 rounded-md resize-none"
							rows={5}
						/>
					</div>
					{errors && (
						<div className="flex flex-col mb-3">
							{errors.name && (
								<span className="text-red-600">
									- The Name Field is Required
								</span>
							)}
							{errors.email && (
								<span className="text-red-600">
									- The Email Field is Required
								</span>
							)}
							{errors.comment && (
								<span className="text-red-600">
									- The Comment Field is Required
								</span>
							)}
						</div>
					)}
					<Button type="submit">Submit</Button>
				</form>
			)}
		</div>
	);
};

export default WriteComment;
