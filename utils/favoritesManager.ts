// Utility function for managing favorites in local storage
export const favoritesManager = {
	getAll: (): string[] => {
		if (typeof window === "undefined") return [];

		try {
			const favorites = localStorage.getItem("favoritePackages");
			return favorites ? JSON.parse(favorites) : [];
		} catch (error) {
			console.error("Error getting favorites from localStorage:", error);
			return [];
		}
	},

	add: (packageId: string): void => {
		if (typeof window === "undefined") return;

		try {
			const favorites = favoritesManager.getAll();
			if (!favorites.includes(packageId)) {
				favorites.push(packageId);
				localStorage.setItem("favoritePackages", JSON.stringify(favorites));
			}
		} catch (error) {
			console.error("Error adding favorite to localStorage:", error);
		}
	},

	remove: (packageId: string): void => {
		if (typeof window === "undefined") return;

		try {
			let favorites = favoritesManager.getAll();
			favorites = favorites.filter((id) => id !== packageId);
			localStorage.setItem("favoritePackages", JSON.stringify(favorites));
		} catch (error) {
			console.error("Error removing favorite from localStorage:", error);
		}
	},

	isFavorite: (packageId: string): boolean => {
		if (typeof window === "undefined") return false;

		try {
			const favorites = favoritesManager.getAll();
			return favorites.includes(packageId);
		} catch (error) {
			console.error("Error checking favorite in localStorage:", error);
			return false;
		}
	},
};
