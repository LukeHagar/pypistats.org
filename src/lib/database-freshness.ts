import { prisma } from './prisma.js';

export interface DatabaseFreshness {
  isFresh: boolean;
  lastUpdateDate: Date | null;
  expectedDate: Date;
  daysBehind: number;
  needsUpdate: boolean;
}

/**
 * Check if the database is up to date with the latest data
 */
export async function checkDatabaseFreshness(): Promise<DatabaseFreshness> {
  try {
    // Get the most recent date from the database
    const lastUpdate = await getLastUpdateDate();
    
    // Calculate the expected date (yesterday)
    const expectedDate = getExpectedDate();

    if (lastUpdate === null) {
      return {
        isFresh: false,
        lastUpdateDate: null,
        expectedDate,
        daysBehind: 999,
        needsUpdate: true
      };
    }
    
    // Calculate how many days behind we are
    const daysBehind = lastUpdate 
      ? Math.floor((expectedDate.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
      : 999; // If no data exists, consider it very behind
    
    // Determine if we need an update
    // We consider it fresh if it's within 1 day of expected date
    const isFresh = daysBehind <= 1;
    const needsUpdate = !isFresh;
    
    return {
      isFresh,
      lastUpdateDate: lastUpdate,
      expectedDate,
      daysBehind,
      needsUpdate
    };
  } catch (error) {
    console.error('Error checking database freshness:', error);
    
    // If we can't check, assume we need an update
    return {
      isFresh: false,
      lastUpdateDate: null,
      expectedDate: getExpectedDate(),
      daysBehind: 999,
      needsUpdate: true
    };
  }
}

/**
 * Get the most recent date from any of our data tables
 */
async function getLastUpdateDate(): Promise<Date | null> {
  try {
    // Check multiple tables to find the most recent date
    const queries = [
      prisma.overallDownloadCount.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true }
      }),
      prisma.pythonMajorDownloadCount.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true }
      }),
      prisma.pythonMinorDownloadCount.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true }
      }),
      prisma.systemDownloadCount.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true }
      })
    ];
    
    const results = await Promise.all(queries);
    
    // Find the most recent date across all tables
    const dates = results
      .map(result => result?.date)
      .filter(date => date !== null) as Date[];
    
    if (dates.length === 0) {
      return null;
    }
    
    return new Date(Math.max(...dates.map(date => date.getTime())));
  } catch (error) {
    console.error('Error getting last update date:', error);
    return null;
  }
}

/**
 * Get the expected date (yesterday, since today's data might not be available yet)
 */
function getExpectedDate(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

/**
 * Check if we have data for a specific date
 */
export async function hasDataForDate(date: Date): Promise<boolean> {
  try {
    const count = await prisma.overallDownloadCount.count({
      where: { date }
    });
    
    return count > 0;
  } catch (error) {
    console.error('Error checking data for date:', error);
    return false;
  }
}

/**
 * Get a summary of database freshness for logging
 */
export async function getFreshnessSummary(): Promise<string> {
  const freshness = await checkDatabaseFreshness();
  
  if (freshness.isFresh) {
    return `Database is fresh (last update: ${freshness.lastUpdateDate?.toISOString().split('T')[0]})`;
  } else if (freshness.lastUpdateDate) {
    return `Database is ${freshness.daysBehind} days behind (last update: ${freshness.lastUpdateDate.toISOString().split('T')[0]}, expected: ${freshness.expectedDate.toISOString().split('T')[0]})`;
  } else {
    return 'Database has no data and needs initial population';
  }
} 