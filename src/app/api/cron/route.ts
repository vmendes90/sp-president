import { NextResponse } from 'next/server';
import { fetchLatestSP500Data } from '../../../utils/fetchSP500Data';
import { env } from '~/env';

// Simple authentication for the cron job
function isAuthorized(request: Request) {
  // Check for authorization header or API key
  const authHeader = request.headers.get('Authorization');
  const expectedToken = `Bearer ${env.CRON_SECRET}`;
  
  return authHeader === expectedToken;
}

export async function GET(request: Request) {
  try {
    // Only allow authorized requests
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update S&P 500 data
    const data = await fetchLatestSP500Data();
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated S&P 500 data. Total data points: ${data.length}`,
      lastUpdated: new Date().toISOString(),
      count: data.length
    });
  } catch (error) {
    console.error('Error in cron job updating S&P 500 data:', error);
    return NextResponse.json(
      { error: 'Failed to update S&P 500 data in cron job' },
      { status: 500 }
    );
  }
} 