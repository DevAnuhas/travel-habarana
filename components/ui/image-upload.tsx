"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	X,
	UploadSimple,
	ArrowUp,
	ArrowDown,
	CircleNotch,
	CloudWarning,
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface ImageUploadProps {
	value: string[];
	onChange: (urls: string[]) => void;
	maxFiles?: number;
}

interface UploadingFile {
	file: File;
	progress: number;
	uploading: boolean;
	error: boolean;
	url?: string;
}

export function ImageUpload({
	value = [],
	onChange,
	maxFiles = 5,
}: ImageUploadProps) {
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Initialize with existing URLs
	useEffect(() => {
		if (value.length > 0) {
			const existingUrls = value.map((url, index) => ({
				file: new File([], `existing-file-${index}`),
				progress: 100,
				uploading: false,
				error: false,
				url,
			}));
			setUploadingFiles(existingUrls);
		} else {
			setUploadingFiles([]);
		}
	}, [value]);

	// Update parent component when our internal state changes
	useEffect(() => {
		const urls = uploadingFiles
			.filter((file) => file.progress === 100 && !file.error && file.url)
			.map((file) => file.url as string);

		// Only call onChange if the URLs have actually changed
		if (JSON.stringify(urls) !== JSON.stringify(value)) {
			onChange(urls);
		}
	}, [uploadingFiles, onChange, value]);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			// Check if we're exceeding the max files limit
			if (uploadingFiles.length + acceptedFiles.length > maxFiles) {
				toast.error(`You can only upload up to ${maxFiles} images`);
				return;
			}

			setIsLoading(true);

			try {
				// Get the upload signature from our API
				const signatureResponse = await fetch("/api/cloudinary");
				const signatureData = await signatureResponse.json();

				if (!signatureResponse.ok) {
					throw new Error(
						signatureData.error || "Failed to get upload signature"
					);
				}

				console.log("Received signature data:", signatureData);

				// Add files to our state with 0 progress
				const newFiles = acceptedFiles.map((file) => ({
					file,
					progress: 0,
					uploading: true,
					error: false,
				}));

				setUploadingFiles((prev) => [...prev, ...newFiles]);

				// Upload each file
				const uploadPromises = acceptedFiles.map(async (file) => {
					const formData = new FormData();
					formData.append("file", file);
					formData.append("api_key", signatureData.apiKey);
					formData.append("timestamp", signatureData.timestamp.toString());
					formData.append("signature", signatureData.signature);
					formData.append("upload_preset", signatureData.uploadPreset);

					console.log("Uploading with params:", {
						api_key: signatureData.apiKey,
						timestamp: signatureData.timestamp,
						upload_preset: signatureData.uploadPreset,
						signature: signatureData.signature.substring(0, 10) + "...",
						cloudName: signatureData.cloudName,
					});

					try {
						// Use XMLHttpRequest for progress tracking
						const xhr = new XMLHttpRequest();

						// Track upload progress
						xhr.upload.onprogress = (event) => {
							if (event.lengthComputable) {
								const progress = Math.round((event.loaded / event.total) * 100);

								setUploadingFiles((prev) =>
									prev.map((item) => {
										if (item.file === file) {
											return { ...item, progress };
										}
										return item;
									})
								);
							}
						};

						// Create a promise that resolves when the upload is complete
						const uploadPromise = new Promise<string>((resolve, reject) => {
							xhr.onload = () => {
								if (xhr.status >= 200 && xhr.status < 300) {
									try {
										const response = JSON.parse(xhr.responseText);
										console.log("Upload response:", response);
										resolve(response.secure_url);
									} catch (parseError) {
										console.error("Error parsing response:", parseError);
										reject(new Error("Invalid response format"));
									}
								} else {
									console.error("Upload failed with status:", xhr.status);
									console.error("Response:", xhr.responseText);
									reject(new Error(`Upload failed with status ${xhr.status}`));
								}
							};

							xhr.onerror = () => {
								console.error("Network error during upload");
								reject(new Error("Network error during upload"));
							};

							xhr.ontimeout = () => {
								console.error("Upload timeout");
								reject(new Error("Upload timeout"));
							};
						});

						// Start the upload
						const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
						console.log("Upload URL:", uploadUrl);

						xhr.open("POST", uploadUrl);
						xhr.timeout = 60000; // 60 second timeout
						xhr.send(formData);

						// Wait for the upload to complete
						const url = await uploadPromise;

						// Update our state with the completed upload
						setUploadingFiles((prev) =>
							prev.map((item) => {
								if (item.file === file) {
									return { ...item, uploading: false, progress: 100, url };
								}
								return item;
							})
						);

						return url;
					} catch (error) {
						console.error("Upload error for file:", file.name, error);

						// Mark this file as errored
						setUploadingFiles((prev) =>
							prev.map((item) => {
								if (item.file === file) {
									return { ...item, uploading: false, error: true };
								}
								return item;
							})
						);

						toast.error(
							`Failed to upload ${file.name}: ${
								error instanceof Error ? error.message : "Unknown error"
							}`
						);
						return null;
					}
				});

				const results = await Promise.allSettled(uploadPromises);
				const failedUploads = results.filter(
					(result) => result.status === "rejected"
				).length;
				const successfulUploads = results.filter(
					(result) => result.status === "fulfilled"
				).length;

				if (successfulUploads > 0) {
					toast.success(`Successfully uploaded ${successfulUploads} image(s)`);
				}

				if (failedUploads > 0) {
					toast.error(`Failed to upload ${failedUploads} image(s)`);
				}
			} catch (error) {
				console.error("Error during upload process:", error);
				toast.error(
					"Failed to upload images: " +
						(error instanceof Error ? error.message : "Unknown error")
				);
			} finally {
				setIsLoading(false);
			}
		},
		[uploadingFiles, maxFiles]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".webp"],
		},
		disabled:
			isLoading || uploadingFiles.filter((f) => !f.error).length >= maxFiles,
		maxSize: 5 * 1024 * 1024, // 5MB
	});

	const removeImage = (index: number) => {
		setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const moveImage = (index: number, direction: "up" | "down") => {
		if (
			(direction === "up" && index === 0) ||
			(direction === "down" && index === uploadingFiles.length - 1)
		) {
			return;
		}

		const newIndex = direction === "up" ? index - 1 : index + 1;
		const newFiles = [...uploadingFiles];
		const temp = newFiles[index];
		newFiles[index] = newFiles[newIndex];
		newFiles[newIndex] = temp;

		setUploadingFiles(newFiles);
	};

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={`border-2 border-dashed rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center transition-colors ${
					isDragActive
						? "border-primary bg-primary/5"
						: "border-gray-300 hover:border-primary"
				} ${
					isLoading || uploadingFiles.filter((f) => !f.error).length >= maxFiles
						? "opacity-50 cursor-not-allowed"
						: ""
				}`}
			>
				<input {...getInputProps()} />
				<UploadSimple className="h-10 w-10 text-gray-400 mb-2" />
				<p className="text-sm text-center text-gray-600">
					{isDragActive
						? "Drop the images here..."
						: uploadingFiles.filter((f) => !f.error).length >= maxFiles
						? `Maximum ${maxFiles} files reached`
						: "Drag & drop images here, or click to select files"}
				</p>
				<p className="text-xs text-gray-400 mt-1">
					PNG, JPG, JPEG or WebP (max {maxFiles} files, up to 5MB each)
				</p>
			</div>

			{uploadingFiles.length > 0 && (
				<div className="grid grid-cols-1 gap-4">
					{uploadingFiles.map((file, index) => (
						<div
							key={`${file.file.name}-${index}`}
							className="flex items-center gap-3 p-2 border rounded-md bg-gray-50"
						>
							{/* Image preview */}
							<div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
								{file.url ? (
									<Image
										src={file.url}
										alt="Preview"
										fill
										className="object-cover"
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										{file.error && (
											<CloudWarning className="h-8 w-8 text-red-500" />
										)}
										{file.uploading && (
											<CircleNotch className="h-8 w-8 text-gray-400 animate-spin" />
										)}
									</div>
								)}
							</div>

							{/* File info and progress */}
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{file.file.name.startsWith("existing-file")
										? `Image ${index + 1}`
										: file.file.name}
								</p>
								{file.uploading && (
									<div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
										<div
											className="h-full bg-primary rounded-full transition-all duration-300"
											style={{ width: `${file.progress}%` }}
										/>
									</div>
								)}
								{file.error && (
									<p className="text-xs text-red-500">Upload failed</p>
								)}
								{file.progress === 100 && !file.error && !file.uploading && (
									<p className="text-xs text-green-500">Upload complete</p>
								)}
							</div>

							{/* Actions */}
							<div className="flex gap-1">
								{/* Move up button */}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => moveImage(index, "up")}
									disabled={index === 0 || file.uploading}
								>
									<ArrowUp className="h-4 w-4" />
								</Button>

								{/* Move down button */}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => moveImage(index, "down")}
									disabled={
										index === uploadingFiles.length - 1 || file.uploading
									}
								>
									<ArrowDown className="h-4 w-4" />
								</Button>

								{/* Remove button */}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
									onClick={() => removeImage(index)}
									disabled={file.uploading}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
