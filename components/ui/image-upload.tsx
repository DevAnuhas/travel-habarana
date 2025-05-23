"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
	ImageSquare,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface ImageUploadProps {
	value: string[];
	onChange: (urls: string[]) => void;
	maxFiles?: number;
}

interface UploadingFile {
	id: string;
	file: File;
	progress: number;
	uploading: boolean;
	error: boolean;
	url?: string;
	isExisting?: boolean;
}

// Helper function to generate unique IDs
const generateId = () =>
	`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function ImageUpload({
	value = [],
	onChange,
	maxFiles = 5,
}: ImageUploadProps) {
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const lastValueRef = useRef<string[]>([]);
	const isInitializedRef = useRef(false);

	// Initialize with existing URLs (only once or when value changes significantly)
	useEffect(() => {
		// Check if this is a significant change (not just reordering)
		const valueChanged =
			JSON.stringify(value.sort()) !==
			JSON.stringify(lastValueRef.current.sort());

		if (!isInitializedRef.current || valueChanged) {
			if (value.length > 0) {
				const existingUrls = value.map((url, index) => ({
					id: `existing-${index}-${Date.now()}`, // Generate unique ID
					file: new File([], `existing-file-${index}`),
					progress: 100,
					uploading: false,
					error: false,
					url,
					isExisting: true,
				}));
				setUploadingFiles(existingUrls);
			} else {
				setUploadingFiles([]);
			}
			lastValueRef.current = [...value];
			isInitializedRef.current = true;
		}
	}, [value]);

	// Update parent component when our internal state changes
	useEffect(() => {
		if (!isInitializedRef.current) return;

		const urls = uploadingFiles
			.filter((file) => file.progress === 100 && !file.error && file.url)
			.map((file) => file.url as string);

		// Only call onChange if the URLs have actually changed
		const urlsChanged =
			JSON.stringify(urls) !== JSON.stringify(lastValueRef.current);

		if (urlsChanged) {
			lastValueRef.current = [...urls];
			onChange(urls);
		}
	}, [uploadingFiles, onChange]);

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

				// Add files to our state with 0 progress and unique IDs
				const newFiles = acceptedFiles.map((file) => ({
					id: generateId(), // Generate unique ID for each new file
					file,
					progress: 0,
					uploading: true,
					error: false,
					isExisting: false,
				}));

				setUploadingFiles((prev) => [...prev, ...newFiles]);

				// Upload each file
				const uploadPromises = acceptedFiles.map(async (file, fileIndex) => {
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
						const fileId = newFiles[fileIndex].id;

						// Track upload progress
						xhr.upload.onprogress = (event) => {
							if (event.lengthComputable) {
								const progress = Math.round((event.loaded / event.total) * 100);

								setUploadingFiles((prev) =>
									prev.map((item) => {
										if (item.id === fileId) {
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
								if (item.id === fileId) {
									return {
										...item,
										uploading: false,
										progress: 100,
										url,
										isExisting: false,
									};
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
								if (item.id === newFiles[fileIndex].id) {
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

	const { getInputProps, isDragActive } = useDropzone({
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

	// Fixed reorder handler
	const handleReorder = (newOrder: UploadingFile[]) => {
		setUploadingFiles(newOrder);
	};

	return (
		<motion.div
			className="space-y-4"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			{/* Dropzone */}
			<motion.div
				className={`border-2 border-dashed rounded-lg p-8 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
					isDragActive
						? "border-primary bg-primary/5 scale-105"
						: "border-gray-300 hover:border-primary hover:bg-gray-50"
				}`}
				whileHover={{ scale: isDragActive ? 1.05 : 1 }}
				whileTap={{ scale: 0.98 }}
				animate={{
					borderColor: isDragActive ? "rgb(59 130 246)" : "rgb(209 213 219)",
					backgroundColor: isDragActive
						? "rgb(59 130 246 / 0.05)"
						: "transparent",
				}}
				transition={{ duration: 0.2 }}
				onAnimationStart={undefined}
			>
				<input {...getInputProps()} />
				<motion.div
					animate={{
						y: isDragActive ? -5 : 0,
						scale: isDragActive ? 1.1 : 1,
					}}
					transition={{ duration: 0.2 }}
				>
					<UploadSimple className="h-12 w-12 text-gray-400 mb-3" />
				</motion.div>
				<motion.p
					className="text-base font-medium text-center"
					animate={{
						color: isDragActive ? "rgb(59 130 246)" : "rgb(75 85 99)",
					}}
				>
					{isDragActive
						? "Drop the images here..."
						: "Drag & drop images here, or click to select files"}
				</motion.p>
				<p className="text-sm text-gray-500 mt-2">
					PNG, JPG, JPEG or WebP (max {maxFiles} files, up to 5MB each)
				</p>
			</motion.div>

			{/* Uploaded Images */}
			<AnimatePresence>
				{uploadingFiles.length > 0 && (
					<div className="grid grid-cols-1 gap-4">
						<motion.div
							className="space-y-4"
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium text-gray-900">
									Uploaded Images
								</h4>
								<p className="text-xs text-gray-500">
									{uploadingFiles.filter((f) => !f.error).length} of {maxFiles}{" "}
									images
								</p>
							</div>

							<Reorder.Group
								axis="y"
								values={uploadingFiles}
								onReorder={handleReorder}
								className="space-y-3"
								layoutScroll
								as="div" // Explicitly set as div
							>
								<AnimatePresence mode="popLayout">
									{uploadingFiles.map((file, index) => (
										<Reorder.Item
											key={file.id} // Use the unique ID as key
											value={file}
											dragListener={!file.uploading && !file.error} // Only allow drag when not uploading/error
											className={`cursor-grab active:cursor-grabbing ${
												file.uploading || file.error ? "cursor-not-allowed" : ""
											}`}
											whileDrag={{
												scale: 1.02,
												zIndex: 1000,
												boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
											}}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{
												opacity: 0,
												y: -20,
												scale: 0.95,
											}}
											transition={{
												duration: 0.2,
												layout: { duration: 0.2 },
											}}
											dragTransition={{
												bounceStiffness: 600,
											}}
											as="div" // Explicitly set as div
										>
											<motion.div
												className={`flex items-center gap-4 p-4 border rounded-lg bg-white ${
													index === 0 && "ring-2 ring-blue-500 bg-blue-50"
												}`}
												transition={{ duration: 0.2 }}
												layout
											>
												{/* Drag handle indicator */}
												{!file.uploading && !file.error && (
													<div className="flex flex-col gap-1 opacity-40 hover:opacity-70 transition-opacity">
														<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
														<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
														<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
														<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
													</div>
												)}

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
															<motion.div
																className="h-full bg-blue-500 rounded-full"
																initial={{ width: 0 }}
																animate={{ width: `${file.progress}%` }}
																transition={{ duration: 0.3 }}
															/>
														</div>
													)}
													{file.error && (
														<motion.p
															className="text-xs text-red-500 mt-1"
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
														>
															Upload failed
														</motion.p>
													)}
													{file.progress === 100 &&
														!file.error &&
														!file.uploading &&
														!file.isExisting && (
															<>
																<motion.p
																	className="text-xs text-green-500 mt-1"
																	initial={{ opacity: 0 }}
																	animate={{ opacity: 1 }}
																>
																	Upload complete
																</motion.p>
																{index === 0 && (
																	<motion.p
																		className="text-xs text-primary mt-1 flex items-center gap-1"
																		initial={{ opacity: 0 }}
																		animate={{ opacity: 1 }}
																		transition={{ delay: 0.2 }}
																	>
																		<ImageSquare className="h-3 w-3" />
																		This will be your cover photo
																	</motion.p>
																)}
															</>
														)}
												</div>

												{/* Actions */}
												<div className="flex gap-1">
													{/* Move up button */}
													<motion.div
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
													>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-gray-900 hover:text-gray-600 hover:bg-gray-200"
															onClick={() => moveImage(index, "up")}
															disabled={index === 0 || file.uploading}
														>
															<ArrowUp className="h-4 w-4" />
														</Button>
													</motion.div>

													{/* Move down button */}
													<motion.div
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
													>
														<Button
															type="button"
															variant={"ghost"}
															size="icon"
															className="h-8 w-8 text-gray-900 hover:text-gray-600 hover:bg-gray-200"
															onClick={() => moveImage(index, "down")}
															disabled={
																index === uploadingFiles.length - 1 ||
																file.uploading
															}
														>
															<ArrowDown className="h-4 w-4" />
														</Button>
													</motion.div>

													{/* Remove button */}
													<motion.div
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
													>
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
													</motion.div>
												</div>
											</motion.div>
										</Reorder.Item>
									))}
								</AnimatePresence>
							</Reorder.Group>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
