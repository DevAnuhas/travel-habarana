import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import mongoose from "mongoose";

import connectMongoDB from "@/lib/mongodb";
import PackageModel from "@/models/Package";

export interface PublicPackage {
	_id: string;
	slug: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images: string[];
	createdAt?: string;
	updatedAt?: string;
}

interface PackageDocument {
	_id: mongoose.Types.ObjectId | string;
	slug: string;
	name: string;
	description: string;
	duration: string;
	included: string[];
	images?: string[];
	createdAt?: Date;
	updatedAt?: Date;
}

function serializePackage(packageItem: PackageDocument): PublicPackage {
	return {
		_id: packageItem._id.toString(),
		slug: packageItem.slug,
		name: packageItem.name,
		description: packageItem.description,
		duration: packageItem.duration,
		included: packageItem.included,
		images: packageItem.images ?? [],
		createdAt: packageItem.createdAt?.toISOString(),
		updatedAt: packageItem.updatedAt?.toISOString(),
	};
}

export async function getPackages(): Promise<PublicPackage[]> {
	"use cache";
	cacheLife({ stale: 300, revalidate: 3600, expire: 604800 });
	cacheTag("package");

	await connectMongoDB();
	const packages = (await PackageModel.find({})
		.sort({ createdAt: -1 })
		.lean()) as unknown as PackageDocument[];

	return packages.map(serializePackage);
}

export async function getPackage(
	identifier: string
): Promise<PublicPackage | null> {
	"use cache";
	cacheLife({ stale: 300, revalidate: 3600, expire: 604800 });
	cacheTag("package", `package:${identifier}`);

	await connectMongoDB();

	let packageItem = (await PackageModel.findOne({
		slug: identifier,
	}).lean()) as PackageDocument | null;

	// A renamed package keeps its old URLs; the page 308s them to the current slug.
	// The current-slug lookup runs first, so a live slug always wins over history.
	if (!packageItem) {
		packageItem = (await PackageModel.findOne({
			previousSlugs: identifier,
		}).lean()) as PackageDocument | null;
	}

	if (!packageItem && mongoose.Types.ObjectId.isValid(identifier)) {
		packageItem = (await PackageModel.findById(
			identifier
		).lean()) as PackageDocument | null;
	}

	return packageItem ? serializePackage(packageItem) : null;
}
