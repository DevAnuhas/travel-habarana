import { Progress } from "@/components/ui/progress";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function PasswordStrengthIndicator({
	password,
}: {
	password: string;
}) {
	// Password strength calculation
	const getPasswordStrength = (password: string) => {
		let strength = 0;
		const checks = [
			password.length >= 8,
			/[A-Z]/.test(password),
			/[a-z]/.test(password),
			/[0-9]/.test(password),
			/[^A-Za-z0-9]/.test(password),
		];

		strength = checks.filter(Boolean).length;
		return {
			score: strength,
			percentage: (strength / 5) * 100,
			label:
				strength <= 2
					? "Weak"
					: strength <= 3
					? "Fair"
					: strength <= 4
					? "Good"
					: "Strong",
			color:
				strength <= 2
					? "bg-red-500"
					: strength <= 3
					? "bg-yellow-500"
					: strength <= 4
					? "bg-blue-500"
					: "bg-green-600",
		};
	};

	const passwordStrength = getPasswordStrength(password || "");

	return (
		<motion.div
			className="space-y-2"
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			transition={{ duration: 0.3 }}
		>
			<div className="flex items-center justify-between text-sm">
				<span className="text-muted-foreground">Password strength:</span>
				<span
					className={`font-medium ${
						passwordStrength.score <= 2
							? "text-red-600"
							: passwordStrength.score <= 3
							? "text-yellow-600"
							: passwordStrength.score <= 4
							? "text-blue-600"
							: "text-green-600"
					}`}
				>
					{passwordStrength.label}
				</span>
			</div>
			<Progress value={passwordStrength.percentage} className="h-2" />
			<div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
				<div className="flex items-center gap-1">
					{password.length >= 8 ? (
						<CheckCircle className="h-3 w-3 text-green-600" />
					) : (
						<WarningCircle className="h-3 w-3 text-gray-400" />
					)}
					8+ characters
				</div>
				<div className="flex items-center gap-1">
					{/[A-Z]/.test(password) ? (
						<CheckCircle className="h-3 w-3 text-green-600" />
					) : (
						<WarningCircle className="h-3 w-3 text-gray-400" />
					)}
					Uppercase letter
				</div>
				<div className="flex items-center gap-1">
					{/[a-z]/.test(password) ? (
						<CheckCircle className="h-3 w-3 text-green-600" />
					) : (
						<WarningCircle className="h-3 w-3 text-gray-400" />
					)}
					Lowercase letter
				</div>
				<div className="flex items-center gap-1">
					{/[0-9]/.test(password) ? (
						<CheckCircle className="h-3 w-3 text-green-600" />
					) : (
						<WarningCircle className="h-3 w-3 text-gray-400" />
					)}
					Number
				</div>
				<div className="flex items-center gap-1 col-span-2">
					{/[^A-Za-z0-9]/.test(password) ? (
						<CheckCircle className="h-3 w-3 text-green-600" />
					) : (
						<WarningCircle className="h-3 w-3 text-gray-400" />
					)}
					Special character (!@#$%^&*)
				</div>
			</div>
		</motion.div>
	);
}
