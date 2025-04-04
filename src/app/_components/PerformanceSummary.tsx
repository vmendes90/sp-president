'use client';

import { useEffect, useState, useCallback } from 'react';

// Helper function to format dates
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

interface SP500DataPoint {
  date: string;
  close: number;
}

interface President {
  name: string;
  start: string;
  end: string;
  isCurrent: boolean;
}

interface PerformanceData {
  president: string;
  termStart: string;
  termEnd: string;
  sp500Start: number;
  sp500End: number;
  percentChange: number;
  rank: number;
}

const PerformanceSummary = () => {
  // Store the raw data but don't use directly in rendering
  const [sp500Data, setSP500Data] = useState<SP500DataPoint[]>([]);
  const [presidents, setPresidents] = useState<President[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to find the closest data point to a given date
  const findClosestDataPoint = useCallback((data: SP500DataPoint[], targetDate: string): SP500DataPoint | null => {
    const target = new Date(targetDate);
    
    // Filter data points that are on or after the target date
    const futurePoints = data.filter(point => new Date(point.date) >= target);
    if (futurePoints.length > 0) {
      // Return the first data point on or after the target date
      return futurePoints[0] ?? null;
    }
    
    // If no future points, get the most recent past point
    const pastPoints = data.filter(point => new Date(point.date) < target);
    if (pastPoints.length > 0) {
      return pastPoints[pastPoints.length - 1] ?? null;
    }
    
    return null;
  }, []);

  // Calculate performance for all presidents
  const calculateAllPresidentsPerformance = useCallback((
    presidents: President[], 
    sp500Data: SP500DataPoint[]
  ): PerformanceData[] => {
    // Process each president's term
    const performanceList = presidents.map(president => {
      // Find S&P 500 value at term start and end
      const startDateData = findClosestDataPoint(sp500Data, president.start);
      const endDateData = findClosestDataPoint(sp500Data, president.end);
      
      const sp500Start = startDateData?.close ?? 0;
      const sp500End = endDateData?.close ?? 0;
      
      // Calculate percent change
      const percentChange = sp500Start > 0 
        ? ((sp500End - sp500Start) / sp500Start) * 100 
        : 0;
      
      return {
        president: president.name,
        termStart: president.start,
        termEnd: president.end,
        sp500Start,
        sp500End,
        percentChange,
        rank: 0 // Will be assigned after sorting
      };
    });
    
    // Filter out entries with no data (e.g., future terms or missing data)
    const validPerformance = performanceList.filter(
      p => p.sp500Start > 0 && p.sp500End > 0
    );
    
    // Sort by percent change (descending)
    const sortedPerformance = [...validPerformance].sort(
      (a, b) => b.percentChange - a.percentChange
    );
    
    // Assign ranks
    return sortedPerformance.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [findClosestDataPoint]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch S&P 500 data
        const sp500Response = await fetch('/api/sp500');
        if (!sp500Response.ok) {
          throw new Error('Failed to fetch S&P 500 data');
        }
        const sp500Data = await sp500Response.json() as SP500DataPoint[];
        
        // Fetch presidential data
        const presidentsResponse = await fetch('/api/presidents');
        if (!presidentsResponse.ok) {
          throw new Error('Failed to fetch presidential data');
        }
        const presidentsData = await presidentsResponse.json() as President[];
        
        setSP500Data(sp500Data);
        setPresidents(presidentsData);
        
        // Calculate performance data for all presidents
        const performanceData = calculateAllPresidentsPerformance(presidentsData, sp500Data);
        setPerformanceData(performanceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [calculateAllPresidentsPerformance]);

  // If we don't have data yet, show a loading state
  if (isLoading) {
    return <div className="text-center py-10">Loading performance data...</div>;
  }

  // If there was an error, show an error message
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error}
      </div>
    );
  }

  // Get top and bottom performers
  const topPerformers = performanceData.slice(0, 3);
  const bottomPerformers = performanceData.slice(-3).reverse();

  return (
    <div className="w-full p-6 sm:p-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Presidential Performance Summary</h2>
      
      <div className="mb-10">
        <h3 className="mb-4 text-xl font-semibold text-primary-800">Top Performers</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Rank</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">President</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Term Period</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">S&P 500 Start</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">S&P 500 End</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">% Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {topPerformers.map((president) => (
                <tr key={president.president + president.termStart} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 sm:px-6">{president.rank}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 sm:px-6">{president.president}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 sm:px-6">{`${formatDate(president.termStart)} to ${formatDate(president.termEnd)}`}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 sm:px-6">{president.sp500Start.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 sm:px-6">{president.sp500End.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-green-600 sm:px-6">
                    +{president.percentChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-10">
        <h3 className="mb-4 text-xl font-semibold text-primary-800">Bottom Performers</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Rank</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">President</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Term Period</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">S&P 500 Start</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">S&P 500 End</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">% Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bottomPerformers.map((president) => (
                <tr key={president.president + president.termStart} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 sm:px-6">{president.rank}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 sm:px-6">{president.president}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 sm:px-6">{`${formatDate(president.termStart)} to ${formatDate(president.termEnd)}`}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 sm:px-6">{president.sp500Start.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 sm:px-6">{president.sp500End.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-red-600 sm:px-6">
                    {president.percentChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-xl font-semibold text-primary-800">All Presidents</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Rank</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">President</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Term Period</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">S&P 500 Start</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">S&P 500 End</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">% Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {performanceData.map((president) => (
                <tr 
                  key={president.president + president.termStart} 
                  className={`hover:bg-gray-50 ${president.rank <= 3 ? 'bg-green-50' : (president.rank > performanceData.length - 3 ? 'bg-red-50' : '')}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 sm:px-6">{president.rank}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 sm:px-6">{president.president}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 sm:px-6">{`${formatDate(president.termStart)} to ${formatDate(president.termEnd)}`}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 sm:px-6">{president.sp500Start.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 sm:px-6">{president.sp500End.toFixed(2)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold sm:px-6 ${president.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {president.percentChange >= 0 ? '+' : ''}{president.percentChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary; 