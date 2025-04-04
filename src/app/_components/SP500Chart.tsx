'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

// Register the components we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

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

interface DataPointWithVariation extends SP500DataPoint {
  daysSinceInauguration: number;
  variation: number;
  percentChange: number;
}

const SP500Chart = () => {
  const [sp500Data, setSP500Data] = useState<SP500DataPoint[]>([]);
  const [presidents, setPresidents] = useState<President[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);
  
  // Add state for selected presidents
  const [selectedPresident1, setSelectedPresident1] = useState<string | null>(null);
  const [selectedPresident2, setSelectedPresident2] = useState<string | null>(null);

  // Register zoom plugin only on the client side
  useEffect(() => {
    // Dynamic import of the zoom plugin
    const loadZoomPlugin = async () => {
      try {
        const zoomPlugin = (await import('chartjs-plugin-zoom')).default;
        ChartJS.register(zoomPlugin);
      } catch (error) {
        console.error('Failed to load zoom plugin:', error);
      }
    };
    
    void loadZoomPlugin();
  }, []);

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
        
        // Set default selections - current and former president
        const currentPresIndex = presidentsData.findIndex((p) => p.isCurrent);
        if (currentPresIndex >= 0) {
          setSelectedPresident1(presidentsData[currentPresIndex]?.name ?? null);
          if (currentPresIndex > 0) {
            setSelectedPresident2(presidentsData[currentPresIndex - 1]?.name ?? null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  // If we don't have data yet, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">
          <svg className="mr-2 inline h-6 w-6 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading chart data...
        </div>
      </div>
    );
  }

  // If there was an error, show an error message
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
        <p className="font-medium">Error: {error}</p>
      </div>
    );
  }

  // If we have no data, show a message
  if (sp500Data.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-700">
        <p className="font-medium">No S&P 500 data available. Please initialize the data.</p>
      </div>
    );
  }

  // Get the selected presidents
  const president1 = presidents.find(p => p.name === selectedPresident1) ?? 
    presidents.find(p => p.isCurrent) ?? 
    presidents[presidents.length - 1] ?? 
    { name: 'Unknown', start: '', end: '', isCurrent: true };
  
  const president2 = presidents.find(p => p.name === selectedPresident2) ?? null;

  // Process data for the selected presidents with days since inauguration and price variation
  const processPresidentialData = (rawData: SP500DataPoint[], startDate: string, endDate: string): DataPointWithVariation[] => {
    const filteredData = rawData.filter(
      point => point.date >= startDate && point.date <= endDate
    );
    
    if (filteredData.length === 0) return [];
    
    const inaugurationDate = new Date(startDate);
    const basePrice = filteredData[0]?.close ?? 0;
    
    return filteredData.map((point) => {
      const currentDate = new Date(point.date);
      const daysDiff = Math.floor((currentDate.getTime() - inaugurationDate.getTime()) / (1000 * 60 * 60 * 24));
      const priceVariation = point.close - basePrice;
      const percentChange = (priceVariation / basePrice) * 100;
      
      return {
        ...point,
        daysSinceInauguration: daysDiff,
        variation: priceVariation,
        percentChange: percentChange
      };
    });
  };

  const president1Data = processPresidentialData(sp500Data, president1.start, president1.end);
  const president2Data = president2 
    ? processPresidentialData(sp500Data, president2.start, president2.end)
    : [];

  // Calculate performance metrics for the selected presidents
  const calculatePerformance = (data: DataPointWithVariation[]) => {
    if (data.length < 2) return { priceChange: 0, percentChange: 0 };
    
    const startPrice = data[0]?.close ?? 0;
    const endPrice = data[data.length - 1]?.close ?? 0;
    const priceChange = endPrice - startPrice;
    const percentChange = (priceChange / startPrice) * 100;
    
    return {
      priceChange: Math.round(priceChange * 100) / 100,
      percentChange: Math.round(percentChange * 100) / 100
    };
  };

  const president1Performance = calculatePerformance(president1Data);
  const president2Performance = calculatePerformance(president2Data);

  // Prepare the chart data
  const chartData = {
    datasets: [
      {
        label: president2 ? `${president2.name} (${president2.start.substring(0, 4)}-${president2.end.substring(0, 4)})` : '',
        data: president2Data.map(point => ({ x: point.daysSinceInauguration, y: point.percentChange })),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: `${president1.name} (${president1.start.substring(0, 4)}-${president1.end.substring(0, 4)})`,
        data: president1Data.map(point => ({ x: point.daysSinceInauguration, y: point.percentChange })),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'S&P 500 Performance by Presidential Term',
        font: {
          size: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            
            // Get the original data point from our processed data
            const originalData = datasetIndex === 0 && president2Data.length > 0
              ? president2Data[index]
              : president1Data[index];
            
            if (!originalData) return '';
            
            const lines: string[] = [];
            const dataset = context.dataset;
            lines.push(`${dataset.label}`);
            lines.push(`Date: ${originalData.date}`);
            lines.push(`Close: $${originalData.close.toFixed(2)}`);
            lines.push(`Change: $${originalData.variation.toFixed(2)} (${originalData.percentChange.toFixed(2)}%)`);
            lines.push(`Days since inauguration: ${originalData.daysSinceInauguration}`);
            
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Days Since Inauguration',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price Percentage Change (%)',
        },
        ticks: {
          callback: function(tickValue: string | number) {
            // Convert any value to number and format
            return typeof tickValue === 'number' 
              ? tickValue.toFixed(2) + '%'
              : parseFloat(tickValue).toFixed(2) + '%';
          }
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-0">Presidential Term Comparison</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[180px]">
            <label htmlFor="president1" className="mb-1 block text-sm font-medium text-gray-700">
              First President
            </label>
            <select
              id="president1"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={selectedPresident1 ?? ''}
              onChange={(e) => setSelectedPresident1(e.target.value)}
            >
              {presidents.map((president) => (
                <option key={president.name} value={president.name}>
                  {president.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="min-w-[180px]">
            <label htmlFor="president2" className="mb-1 block text-sm font-medium text-gray-700">
              Second President
            </label>
            <select
              id="president2"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={selectedPresident2 ?? ''}
              onChange={(e) => setSelectedPresident2(e.target.value)}
            >
              <option value="">None</option>
              {presidents.map((president) => (
                <option key={president.name} value={president.name}>
                  {president.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="aspect-[16/9] min-h-[350px] w-full">
        <Line
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {president1Data.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 border-b border-gray-100 pb-2 text-lg font-semibold text-primary-800">
              {president1.name} ({new Date(president1.start).getFullYear()}-{president1.isCurrent ? 'Present' : new Date(president1.end).getFullYear()})
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Term Start:</span> {formatDate(president1.start)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">S&P 500 Start Value:</span> {president1Data[0]?.close.toFixed(2)}
              </p>
              {president1.isCurrent ? (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current S&P 500 Value:</span> {president1Data[president1Data.length - 1]?.close.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Term End:</span> {formatDate(president1.end)}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">S&P 500 End Value:</span> {president1Data[president1Data.length - 1]?.close.toFixed(2)}
              </p>
              <p className={`text-sm font-bold ${president1Performance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Change: {president1Performance.priceChange.toFixed(2)} ({president1Performance.percentChange.toFixed(2)}%)
              </p>
            </div>
          </div>
        )}
        
        {president2Data.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 border-b border-gray-100 pb-2 text-lg font-semibold text-secondary-700">
              {president2?.name} ({new Date(president2?.start ?? '').getFullYear()}-{president2?.isCurrent ? 'Present' : new Date(president2?.end ?? '').getFullYear()})
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Term Start:</span> {formatDate(president2?.start ?? '')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">S&P 500 Start Value:</span> {president2Data[0]?.close.toFixed(2)}
              </p>
              {president2?.isCurrent ? (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current S&P 500 Value:</span> {president2Data[president2Data.length - 1]?.close.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Term End:</span> {formatDate(president2?.end ?? '')}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">S&P 500 End Value:</span> {president2Data[president2Data.length - 1]?.close.toFixed(2)}
              </p>
              <p className={`text-sm font-bold ${president2Performance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Change: {president2Performance.priceChange.toFixed(2)} ({president2Performance.percentChange.toFixed(2)}%)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SP500Chart; 