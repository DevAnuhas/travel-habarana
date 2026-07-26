import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

export default function PackageNotFound() {
	return (
		<main className="flex min-h-[70vh] items-center justify-center px-4 pt-20">
			<div className="max-w-xl space-y-6 text-center">
				<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
					Package not found
				</p>
				<h1 className="font-serif text-4xl text-gray-950 sm:text-5xl">
					This safari is no longer available at this address.
				</h1>
				<p className="text-balance text-gray-600">
					Browse our current safari and cultural experiences, or contact us
					for help choosing the right trip.
				</p>
				<Button asChild>
					<Link href="/packages">
						<ArrowLeft aria-hidden className="mr-2 size-4" />
						View all packages
					</Link>
				</Button>
			</div>
		</main>
	);
}
