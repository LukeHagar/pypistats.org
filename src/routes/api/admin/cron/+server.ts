import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Cron removed; keep endpoint for compatibility
export const GET: RequestHandler = async () => {
  return json({ success: true, message: 'Cron removed; on-demand ingestion active.' });
};

export const POST: RequestHandler = async () => {
  return json({ success: true, message: 'Cron removed; on-demand ingestion active.' });
};