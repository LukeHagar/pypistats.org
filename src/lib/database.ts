// Database types and constants
export const RECENT_CATEGORIES = ['day', 'week', 'month'];

// Re-export Prisma types for convenience
export type { 
  RecentDownloadCount,
  OverallDownloadCount,
  PythonMajorDownloadCount,
  PythonMinorDownloadCount,
  SystemDownloadCount
} from '@prisma/client'; 