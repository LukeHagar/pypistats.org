import { prisma } from './prisma.js';
import { RECENT_CATEGORIES } from './database.js';
import { CacheManager } from './redis.js';

const cache = new CacheManager();

export type Results = {
  date: string;
  category: string;
  downloads: number | bigint;
}

export async function getRecentDownloads(packageName: string, category?: string): Promise<Results[]> {
  const cacheKey = CacheManager.getRecentStatsKey(packageName);
  
  // Try to get from cache first
  const cached = await cache.get<Results[]>(cacheKey);
  if (cached && !category) {
    return cached;
  } 

  if (category && RECENT_CATEGORIES.includes(category)) {
    // Compute recent from overall without mirrors
    const bounds = getRecentBounds(category);
    const result = await prisma.overallDownloadCount.groupBy({
      by: ['package'],
      where: {
        package: packageName,
        category: 'without_mirrors',
        date: { gte: bounds.start }
      },
      _sum: { downloads: true }
    });
    return result.map(r => ({
      date: new Date().toISOString().split('T')[0],
      category,
      downloads: r._sum.downloads || 0
    }));
  }
  
  // Default: return day/week/month computed on the fly
  const day: Results[] = await getRecentDownloads(packageName, 'day');
  const week: Results[] = await getRecentDownloads(packageName, 'week');
  const month: Results[] = await getRecentDownloads(packageName, 'month');
  const result: Results[] = [...day, ...week, ...month];

  // Cache the result for 1 hour
  await cache.set(cacheKey, result, 3600);
  
  return result;
}

function getRecentBounds(category: string) {
  const today = new Date();
  let start = new Date(today);
  if (category === 'day') {
    // include today
  } else if (category === 'week') {
    start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (category === 'month') {
    start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return { start };
}

export async function getOverallDownloads(packageName: string, mirrors?: string) {
  const cacheKey = CacheManager.getPackageKey(packageName, `overall_${mirrors || 'all'}`);
  
  // Try to get from cache first
  const cached = await cache.get<Results[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const whereClause: any = {
    package: packageName
  };
  
  if (mirrors === 'true') {
    whereClause.category = 'with_mirrors';
  } else if (mirrors === 'false') {
    whereClause.category = 'without_mirrors';
  }
  
  const result = await prisma.overallDownloadCount.findMany({
    where: whereClause,
    orderBy: {
      date: 'asc'
    }
  });

  // Cache the result for 1 hour
  await cache.set(cacheKey, result, 3600);
  
  return result;
}

export async function getPythonMajorDownloads(packageName: string, version?: string) {
  const cacheKey = CacheManager.getPackageKey(packageName, `python_major_${version || 'all'}`);
  
  // Try to get from cache first
  const cached = await cache.get<Results[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const whereClause: any = {
    package: packageName
  };
  
  if (version) {
    whereClause.category = version;
  }
  
  const result = await prisma.pythonMajorDownloadCount.findMany({
    where: whereClause,
    orderBy: {
      date: 'asc'
    }
  });

  // Cache the result for 1 hour
  await cache.set(cacheKey, result, 3600);
  
  return result;
}

export async function getPythonMinorDownloads(packageName: string, version?: string) {
  const cacheKey = CacheManager.getPackageKey(packageName, `python_minor_${version || 'all'}`);
  
  // Try to get from cache first
  const cached = await cache.get<Results[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const whereClause: any = {
    package: packageName
  };
  
  if (version) {
    whereClause.category = version;
  }
  
  const result = await prisma.pythonMinorDownloadCount.findMany({
    where: whereClause,
    orderBy: {
      date: 'asc'
    }
  });

  // Cache the result for 1 hour
  await cache.set(cacheKey, result, 3600);
  
  return result;
}

export async function getSystemDownloads(packageName: string, os?: string) {
  const cacheKey = CacheManager.getPackageKey(packageName, `system_${os || 'all'}`);
  
  // Try to get from cache first
  const cached = await cache.get<Results[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const whereClause: any = {
    package: packageName
  };
  
  if (os) {
    whereClause.category = os;
  }
  
  const result = await prisma.systemDownloadCount.findMany({
    where: whereClause,
    orderBy: {
      date: 'asc'
    }
  });

  // Cache the result for 1 hour
  await cache.set(cacheKey, result, 3600);
  
  return result;
}

export async function searchPackages(searchTerm: string) {
  const cacheKey = CacheManager.getSearchKey(searchTerm);
  
  // Try to get from cache first
  const cached = await cache.get<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const results = await prisma.recentDownloadCount.findMany({
    where: {
      package: {
        startsWith: searchTerm
      },
      category: 'month'
    },
    select: {
      package: true
    },
    distinct: ['package'],
    orderBy: {
      package: 'asc'
    },
    take: 20
  });
  
  const packages = results.map(result => result.package);

  // Cache the result for 30 minutes (search results change less frequently)
  await cache.set(cacheKey, packages, 1800);
  
  return packages;
}

export async function getPackageCount() {
  const cacheKey = CacheManager.getPackageCountKey();
  
  // Try to get from cache first
  const cached = await cache.get<number>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const result = await prisma.recentDownloadCount.groupBy({
    by: ['package'],
    where: {
      category: 'month'
    }
  });
  
  const count = result.length;

  // Cache the result for 1 hour
  await cache.set(cacheKey, count, 3600);
  
  return count;
}

// Cache invalidation functions
export async function invalidatePackageCache(packageName: string) {
  const patterns = [
    CacheManager.getRecentStatsKey(packageName),
    CacheManager.getPackageKey(packageName, 'overall_all'),
    CacheManager.getPackageKey(packageName, 'overall_true'),
    CacheManager.getPackageKey(packageName, 'overall_false'),
    CacheManager.getPackageKey(packageName, 'python_major_all'),
    CacheManager.getPackageKey(packageName, 'python_minor_all'),
    CacheManager.getPackageKey(packageName, 'system_all'),
  ];
  
  for (const pattern of patterns) {
    await cache.del(pattern);
  }
}

export async function invalidateSearchCache() {
  // This would need to be implemented with pattern matching
  // For now, we'll just clear the package count cache
  await cache.del(CacheManager.getPackageCountKey());
}

export async function clearAllCache() {
  await cache.flush();
} 