import { searchPackages } from '$lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const searchTerm = url.searchParams.get('q');
	
	if (!searchTerm) {
		return {
			packages: [],
			searchTerm: null
		};
	}
	
	try {
		const packages = await searchPackages(searchTerm);
		return {
			packages,
			searchTerm
		};
	} catch (error) {
		console.error('Error searching packages:', error);
		return {
			packages: [],
			searchTerm
		};
	}
}; 

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const searchTerm = formData.get('q');
		if (!searchTerm) {
			return {
				packages: [],
				searchTerm: null
			};
		}
		try {
			const packages = await searchPackages(searchTerm.toString());
			return {
				packages,
				searchTerm
			};
		} catch (error) {
			console.error('Error searching packages:', error);
			return {
				packages: [],
				searchTerm
			};
		}
	}
};

