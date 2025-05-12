import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center w-full">
			<LoaderCircle className="animate-spin h-12 w-12 text-primary" />
		</div>
	);
}
