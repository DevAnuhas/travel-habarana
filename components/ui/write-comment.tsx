"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";

interface FormInput {
	_id: string;
	name: string;
	comment: string;
	website: string;
}
const WriteComment = ({ _id }: { _id: string }) => {
	const [submitted, setSubmitted] = useState(false);
	const [submissionError, setSubmissionError] = useState("");
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInput>();

	const onSubmit: SubmitHandler<FormInput> = async (data) => {
		setSubmissionError("");

		try {
			const response = await fetch("/api/create-comment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
				}),
			});

			if (!response.ok) {
				const result = await response.json().catch(() => null);
				throw new Error(result?.error || "Could not submit your comment");
			}

			setSubmitted(true);
		} catch (error) {
			console.error("Create comment error", error);
			setSubmissionError(
				error instanceof Error
					? error.message
					: "Could not submit your comment"
			);
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
					<input
						{...register("website")}
						type="text"
						name="website"
						tabIndex={-1}
						autoComplete="off"
						aria-hidden="true"
						className="absolute -left-[9999px] size-px"
					/>
					<div className="flex flex-col gap-1 mb-2">
						<label className="text-gray-700 font-medium">Name</label>
						<input
							{...register("name", {
								required: true,
								minLength: 2,
								maxLength: 80,
							})}
							type="text"
							placeholder="Enter your name"
							className="w-full px-4 py-2 text-gray-700 bg-white border-2 outline-none focus:border-blue-600 rounded-md"
						/>
					</div>
					<div className="flex flex-col gap-1 mb-2">
						<label className="text-gray-700 font-medium">Comment</label>
						<textarea
							{...register("comment", {
								required: true,
								minLength: 3,
								maxLength: 2000,
							})}
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
							{errors.comment && (
								<span className="text-red-600">
									- The Comment Field is Required
								</span>
							)}
						</div>
					)}
					{Boolean(submissionError) && (
						<p role="alert" className="mb-3 text-sm text-red-600">
							{submissionError}
						</p>
					)}
					<Button type="submit">Submit</Button>
				</form>
			)}
		</div>
	);
};

export default WriteComment;
