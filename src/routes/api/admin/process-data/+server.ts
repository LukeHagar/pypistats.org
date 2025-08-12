import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DataProcessor } from '$lib/data-processor.js';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { date, purge = true } = body;

    console.log('Starting data processing via API...');
    
    const processor = new DataProcessor();
    const results = await processor.etl(date, purge);

    return json({
      success: true,
      message: 'Data processing completed successfully',
      results
    });
  } catch (error) {
    console.error('Data processing failed:', error);
    return json({
      success: false,
      message: 'Data processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 