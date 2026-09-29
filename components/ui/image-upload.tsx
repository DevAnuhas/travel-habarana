"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
	StarFour,
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

const toExistingFiles = (urls: readonly string[]): UploadingFile[] =>
	urls.map((url, index) => ({
		id: `existing-${generateId()}`,
		file: new File([], `existing-file-${index}`),
		progress: 100,
		uploading: false,
		error: false,
		url,
		isExisting: true,
	}));

const sameOrder = (a: readonly string[], b: readonly string[]) =>
	a.length === b.length && a.every((url, index) => url === b[index]);

const completedUrls = (files: readonly UploadingFile[]) =>
	files
		.filter((file) => file.progress === 100 && !file.error && file.url)
		.map((file) => file.url as string);

const errorMessage = (error: unknown) =>
	error instanceof Error ? error.message : "Unknown error";

interface CloudinarySignature {
	apiKey: string;
	timestamp: number;
	signature: string;
	uploadPreset: string;
	cloudName: string;
	error?: string;
}

/**
 * Uploads one file with progress reports. Aborting the signal cancels the
 * request and rejects; a load event that still fires afterwards is ignored.
 */
function uploadToCloudinary(
	file: File,
	signature: CloudinarySignature,
	signal: AbortSignal,
	onProgress: (percent: number) => void
): Promise<string> {
	return new Promise((resolve, reject) => {
		const cancelled = () =>
			reject(new DOMException("Upload cancelled", "AbortError"));
		if (signal.aborted) return cancelled();

		const xhr = new XMLHttpRequest();
		const abort = () => xhr.abort();
		signal.addEventListener("abort", abort, { once: true });
		const settle = (finish: () => void) => {
			signal.removeEventListener("abort", abort);
			finish();
		};

		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				onProgress(Math.round((event.loaded / event.total) * 100));
			}
		};
		xhr.onload = () =>
			settle(() => {
				if (xhr.status < 200 || xhr.status >= 300) {
					console.error("Upload failed:", xhr.status, xhr.responseText);
					return reject(new Error(`Upload failed with status ${xhr.status}`));
				}
				try {
					resolve(JSON.parse(xhr.responseText).secure_url);
				} catch (parseError) {
					console.error("Error parsing response:", parseError);
					reject(new Error("Invalid response format"));
				}
			});
		xhr.onerror = () =>
			settle(() => reject(new Error("Network error during upload")));
		xhr.ontimeout = () => settle(() => reject(new Error("Upload timeout")));
		xhr.onabort = () => settle(cancelled);

		const formData = new FormData();
		formData.append("file", file);
		formData.append("api_key", signature.apiKey);
		formData.append("timestamp", signature.timestamp.toString());
		formData.append("signature", signature.signature);
		formData.append("upload_preset", signature.uploadPreset);

		xhr.open(
			"POST",
			`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`
		);
		xhr.timeout = 60000;
		xhr.send(formData);
	});
}

/**
 * One editing session of the field. `generation` changes whenever the form
 * hands over a value this component did not emit (a reset after save, another
 * package); upload work started in an older session must not touch the new one.
 */
interface Session {
	generation: number;
	files: UploadingFile[];
	isLoading: boolean;
}

const startSession = (generation: number, urls: readonly string[]): Session => ({
	generation,
	files: toExistingFiles(urls),
	isLoading: false,
});

// A stable fallback: a fresh [] per render would look like a new form value.
const NO_URLS: string[] = [];

export function ImageUpload({
	value = NO_URLS,
	onChange,
	maxFiles = 5,
}: ImageUploadProps) {
	const [session, setSession] = useState(() => startSession(0, value));
	const { generation, files: uploadingFiles, isLoading } = session;
	const shownUrls = useMemo(
		() => completedUrls(uploadingFiles),
		[uploadingFiles]
	);

	// Our own emissions come back equal to what we show. Any other new value
	// came from the form, even when only its order differs (the form saves its
	// first photo as the lead), and starts a new session. Adjusted during render
	// so the effect below never compares against previews one render behind.
	// Limitation: a reset to exactly the shown list cannot be told apart from
	// our own change and keeps any upload still in flight.
	const [previousValue, setPreviousValue] = useState(value);
	if (value !== previousValue) {
		setPreviousValue(value);
		if (!sameOrder(value, shownUrls)) {
			setSession(startSession(generation + 1, value));
		}
	}

	// Report finished uploads, removals and reorders to the form.
	useEffect(() => {
		if (!sameOrder(shownUrls, value)) onChange(shownUrls);
	}, [shownUrls, value, onChange]);

	// One AbortController per session: a new session or unmount (the dialog
	// closing) cancels the signature request and every upload still running.
	const controllerRef = useRef<AbortController | null>(null);
	useEffect(() => {
		const controller = new AbortController();
		controllerRef.current = controller;
		return () => controller.abort();
	}, [generation]);

	// Applies an update only while the session it was started in is current.
	const updateSession = useCallback(
		(startedIn: number, update: (current: Session) => Session) =>
			setSession((current) =>
				current.generation === startedIn ? update(current) : current
			),
		[]
	);
	const updateFile = useCallback(
		(startedIn: number, id: string, patch: Partial<UploadingFile>) =>
			updateSession(startedIn, (current) => ({
				...current,
				files: current.files.map((file) =>
					file.id === id ? { ...file, ...patch } : file
				),
			})),
		[updateSession]
	);
	const setFiles = (files: UploadingFile[]) =>
		setSession((current) => ({ ...current, files }));

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			// Check if we're exceeding the max files limit
			if (uploadingFiles.length + acceptedFiles.length > maxFiles) {
				toast.error(`You can only upload up to ${maxFiles} images`);
				return;
			}
			const signal = controllerRef.current?.signal;
			if (!signal) return;

			updateSession(generation, (current) => ({ ...current, isLoading: true }));

			try {
				const signatureResponse = await fetch("/api/cloudinary", { signal });
				const signatureData: CloudinarySignature =
					await signatureResponse.json();
				if (signal.aborted) return;

				if (!signatureResponse.ok) {
					throw new Error(
						signatureData.error || "Failed to get upload signature"
					);
				}

				const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
					id: generateId(),
					file,
					progress: 0,
					uploading: true,
					error: false,
					isExisting: false,
				}));
				updateSession(generation, (current) => ({
					...current,
					files: [...current.files, ...newFiles],
				}));

				const urls = await Promise.all(
					newFiles.map(async ({ id, file }) => {
						try {
							const url = await uploadToCloudinary(
								file,
								signatureData,
								signal,
								(progress) => updateFile(generation, id, { progress })
							);
							updateFile(generation, id, {
								uploading: false,
								progress: 100,
								url,
							});
							return url;
						} catch (error) {
							if (signal.aborted) return null;
							console.error("Upload error for file:", file.name, error);
							updateFile(generation, id, { uploading: false, error: true });
							toast.error(`Failed to upload ${file.name}: ${errorMessage(error)}`);
							return null;
						}
					})
				);
				if (signal.aborted) return;

				// Count results, not settled promises: each upload catches its
				// own failure and would otherwise count as a success.
				const uploaded = urls.filter(Boolean).length;
				if (uploaded > 0) {
					toast.success(`Successfully uploaded ${uploaded} image(s)`);
				}
			} catch (error) {
				if (signal.aborted) return;
				console.error("Error during upload process:", error);
				toast.error(`Failed to upload images: ${errorMessage(error)}`);
			} finally {
				updateSession(generation, (current) => ({
					...current,
					isLoading: false,
				}));
			}
		},
		[uploadingFiles.length, maxFiles, generation, updateSession, updateFile]
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
		setFiles(uploadingFiles.filter((_, i) => i !== index));
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

		setFiles(newFiles);
	};

	const handleReorder = (newOrder: UploadingFile[]) => {
		setFiles(newOrder);
	};

	const isDisabled =
		isLoading || uploadingFiles.filter((f) => !f.error).length >= maxFiles;

	return (
		<div className="space-y-4">
			{/* Dropzone */}
			<div
				{...getRootProps()}
				className={`border-2 border-dashed rounded-lg p-8 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
					isDragActive
						? "border-primary bg-primary/5"
						: isDisabled
						? "border-gray-200 bg-gray-50 cursor-not-allowed"
						: "border-gray-300 hover:border-primary hover:bg-gray-50"
				}`}
			>
				<input {...getInputProps()} />
				<motion.div
					animate={{
						y: isDragActive ? -5 : 0,
						scale: isDragActive ? 1.1 : 1,
					}}
					transition={{ duration: 0.2 }}
					style={{ pointerEvents: "none" }}
				>
					<UploadSimple
						className={`h-12 w-12 mb-3 ${
							isDisabled ? "text-gray-300" : "text-gray-400"
						}`}
					/>
				</motion.div>
				<motion.p
					className="text-base font-medium text-center"
					animate={{
						color: isDragActive
							? "rgb(59 130 246)"
							: isDisabled
							? "rgb(156 163 175)"
							: "rgb(75 85 99)",
					}}
					style={{ pointerEvents: "none" }} // Prevent motion div from blocking clicks
				>
					{isDragActive
						? "Drop the images here..."
						: isDisabled
						? `Maximum ${maxFiles} files reached`
						: "Drag & drop images here, or click to select files"}
				</motion.p>
				<p
					className={`text-sm mt-2 ${
						isDisabled ? "text-gray-400" : "text-gray-500"
					}`}
					style={{ pointerEvents: "none" }}
				>
					PNG, JPG, JPEG or WebP (max {maxFiles} files, up to 5MB each)
				</p>
			</div>

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
															sizes="64px"
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
															</>
														)}
													{index === 0 && !file.error && !file.uploading && (
														<motion.p
															className="text-xs text-primary mt-1.5 flex items-center gap-1"
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															transition={{ delay: 0.2 }}
														>
															<StarFour className="h-3 w-3" />
															This will be your cover photo
														</motion.p>
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
															aria-label={`Move image ${index + 1} up`}
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
															aria-label={`Move image ${index + 1} down`}
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
															aria-label={`Remove image ${index + 1}`}
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
		</div>
	);
}
