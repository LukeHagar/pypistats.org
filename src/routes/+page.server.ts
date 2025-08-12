import { getPackageCount } from '$lib/api.js';

export const load = async () => {
	try {
		const packageCount = getPackageCount();
		return {
			packageCount
		};
	} catch (error) {
		console.error('Error loading page data:', error);
		return {
			packageCount: 0
		};
	}
}; 