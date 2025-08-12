import { closeRedisClient, forceDisconnectRedis } from '$lib/redis.js';
import type { Handle } from '@sveltejs/kit';

// Minimal server hooks without cron
if (typeof process !== 'undefined') {
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, closing connections...');
    await closeRedisClient();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, closing connections...');
    await closeRedisClient();
    process.exit(0);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('🛑 Uncaught Exception:', error);
    await forceDisconnectRedis();
    process.exit(1);
  });
  
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('🛑 Unhandled Rejection at:', promise, 'reason:', reason);
    await forceDisconnectRedis();
    process.exit(1);
  });
}

export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event);
};