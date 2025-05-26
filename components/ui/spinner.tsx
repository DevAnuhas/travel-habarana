import { CircleNotch } from "@phosphor-icons/react/dist/ssr";

export default function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center w-full">
			<CircleNotch className="animate-spin h-12 w-12 text-primary" />
		</div>
	);
}
