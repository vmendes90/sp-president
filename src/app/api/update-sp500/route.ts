import { NextResponse } from 'next/server';
import { fetchHistoricalSP500Data, fetchLatestSP500Data } from '../../../utils/fetchSP500Data';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');

    if (mode === 'historical') {
      // Fetch all historical data
      const data = await fetchHistoricalSP500Data();
      return NextResponse.json({
        message: `Successfully fetched ${data.length} historical data points.`,
        count: data.length
      });
    } else {
      // Default: update with latest data
      const data = await fetchLatestSP500Data();
      return NextResponse.json({
        message: `Successfully updated S&P 500 data. Total data points: ${data.length}`,
        count: data.length
      });
    }
  } catch (error) {
    console.error('Error updating S&P 500 data:', error);
    return NextResponse.json(
      { error: 'Failed to update S&P 500 data' },
      { status: 500 }
    );
  }
} 