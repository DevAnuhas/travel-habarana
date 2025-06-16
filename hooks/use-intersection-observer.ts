import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverProps {
	threshold?: number;
	rootMargin?: string;
	enabled?: boolean;
}

export function useIntersectionObserver({
	threshold = 0,
	rootMargin = "0px",
	enabled = true,
}: UseIntersectionObserverProps = {}) {
	const [ref, setRef] = useState<Element | null>(null);
	const [isIntersecting, setIsIntersecting] = useState(false);
	const observer = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		if (!enabled) {
			setIsIntersecting(false);
			return;
		}

		if (observer.current) {
			observer.current.disconnect();
		}

		observer.current = new IntersectionObserver(
			([entry]) => {
				// Update our state when observer callback fires
				if (entry) {
					setIsIntersecting(entry.isIntersecting);
				}
			},
			{ rootMargin, threshold }
		);

		const currentObserver = observer.current;

		if (ref) {
			currentObserver.observe(ref);
		}

		return () => {
			if (currentObserver) {
				currentObserver.disconnect();
			}
		};
	}, [ref, rootMargin, threshold, enabled]);

	return { ref: setRef, isIntersecting };
}
