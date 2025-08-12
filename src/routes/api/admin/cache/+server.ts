import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CacheManager } from '$lib/redis.js';
import { clearAllCache, invalidatePackageCache, invalidateSearchCache } from '$lib/api.js';

const cache = new CacheManager();

export const GET: RequestHandler = async () => {
  try {
    // Get cache statistics
    const stats = {
      message: 'Cache management endpoint',
      operations: ['GET', 'POST', 'DELETE'],
      endpoints: {
        'GET /api/admin/cache': 'Get cache information',
        'POST /api/admin/cache/clear': 'Clear all cache',
        'POST /api/admin/cache/invalidate-package': 'Invalidate package cache',
        'POST /api/admin/cache/invalidate-search': 'Invalidate search cache'
      }
    };
    
    return json(stats);
  } catch (error) {
    return json({ error: 'Failed to get cache information' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, packageName } = body;
    
    switch (action) {
      case 'clear':
        await clearAllCache();
        return json({ 
          success: true, 
          message: 'All cache cleared successfully' 
        });
        
      case 'invalidate-package':
        if (!packageName) {
          return json({ 
            error: 'Package name is required' 
          }, { status: 400 });
        }
        await invalidatePackageCache(packageName);
        return json({ 
          success: true, 
          message: `Cache invalidated for package: ${packageName}` 
        });
        
      case 'invalidate-search':
        await invalidateSearchCache();
        return json({ 
          success: true, 
          message: 'Search cache invalidated successfully' 
        });
        
      default:
        return json({ 
          error: 'Invalid action. Use: clear, invalidate-package, or invalidate-search' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Cache management error:', error);
    return json({ 
      error: 'Cache management failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async () => {
  try {
    await clearAllCache();
    return json({ 
      success: true, 
      message: 'All cache cleared successfully' 
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return json({ 
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 