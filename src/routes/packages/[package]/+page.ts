import { 
	getRecentDownloads, 
	getOverallDownloads, 
	getPythonMajorDownloads, 
	getPythonMinorDownloads, 
	getSystemDownloads 
} from '$lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const packageName = params.package?.replace(/\./g, '-').replace(/_/g, '-') || '';
	
	if (!packageName || packageName === '__all__') {
		return {
			packageName,
			recentStats: null,
			overallStats: [],
			pythonMajorStats: [],
			pythonMinorStats: [],
			systemStats: []
		};
	}
	
	try {
		// Fetch all statistics in parallel
		const [recentStats, overallStats, pythonMajorStats, pythonMinorStats, systemStats] = await Promise.all([
			getRecentDownloads(packageName),
			getOverallDownloads(packageName),
			getPythonMajorDownloads(packageName),
			getPythonMinorDownloads(packageName),
			getSystemDownloads(packageName)
		]);
		
		// Process recent stats into the expected format
		const recentStatsFormatted: Record<string, number> = {};
		for (const stat of recentStats) {
			recentStatsFormatted[`last_${stat.category}`] = Number(stat.downloads);
		}
		
		return {
			packageName,
			recentStats: recentStatsFormatted,
			overallStats,
			pythonMajorStats,
			pythonMinorStats,
			systemStats
		};
	} catch (error) {
		console.error('Error loading package data:', error);
		return {
			packageName,
			recentStats: null,
			overallStats: [],
			pythonMajorStats: [],
			pythonMinorStats: [],
			systemStats: []
		};
	}
}; 