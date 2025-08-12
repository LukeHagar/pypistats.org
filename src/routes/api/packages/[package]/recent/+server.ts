import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecentDownloads } from '$lib/api.js';
import { RECENT_CATEGORIES } from '$lib/database.js';
import { RateLimiter } from '$lib/redis.js';
import { DataProcessor } from '$lib/data-processor.js';

const rateLimiter = new RateLimiter();

export const GET: RequestHandler = async ({ params, url, request }) => {
    const packageName = params.package?.replace(/\./g, '-').replace(/_/g, '-') || '';
    const category = url.searchParams.get('period');
    
    if (packageName === '__all__') {
        return json({ error: 'Invalid package name' }, { status: 400 });
    }
    
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const rateLimitKey = `rate_limit:recent:${clientIP}`;
    
    const isLimited = await rateLimiter.isRateLimited(rateLimitKey, 100, 3600); // 100 requests per hour
    if (isLimited) {
        return json({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
        }, { status: 429 });
    }
    
    try {
        // Ensure package data is present/fresh on demand
        const processor = new DataProcessor();
        await processor.ensurePackageFreshness(packageName);

        const downloads = await getRecentDownloads(packageName, category || undefined);
        
        if (downloads.length === 0) {
            return json({ error: 'Package not found' }, { status: 404 });
        }
        
        const response: any = {
            package: packageName,
            type: 'recent_downloads'
        };
        
        if (category) {
            response.data = { [`last_${category}`]: 0 };
        } else {
            response.data = { [`last_${RECENT_CATEGORIES[0]}`]: 0, [`last_${RECENT_CATEGORIES[1]}`]: 0, [`last_${RECENT_CATEGORIES[2]}`]: 0 };
        }
        
        for (const download of downloads) {
            response.data[`last_${download.category}`] = download.downloads;
        }
        
        // Add rate limit headers
        const remaining = await rateLimiter.getRemainingRequests(rateLimitKey);
        const headers = {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 3600).toString()
        };
        
        return json(response, { headers });
    } catch (error) {
        console.error('Error fetching recent downloads:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 