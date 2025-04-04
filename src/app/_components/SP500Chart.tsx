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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch S&P 500 data
        const sp500Response = await fetch('/api/sp500');
        if (!sp500Response.ok) {
          throw new Error('Failed to fetch S&P 500 data');
        }
        const sp500Data = await sp500Response.json();
        
        // Fetch presidential data
        const presidentsResponse = await fetch('/api/presidents');
        if (!presidentsResponse.ok) {
          throw new Error('Failed to fetch presidential data');
        }
        const presidentsData = await presidentsResponse.json();
        
        setSP500Data(sp500Data);
        setPresidents(presidentsData);
        
        // Set default selections - current and former president
        const currentPresIndex = presidentsData.findIndex((p: President) => p.isCurrent);
        if (currentPresIndex >= 0) {
          setSelectedPresident1(presidentsData[currentPresIndex].name);
          if (currentPresIndex > 0) {
            setSelectedPresident2(presidentsData[currentPresIndex - 1].name);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // If we don't have data yet, show a loading state
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // If there was an error, show an error message
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error}
      </div>
    );
  }

  // If we have no data, show a message
  if (sp500Data.length === 0) {
    return (
      <div className="text-center py-10">
        No S&P 500 data available. Please initialize the data.
      </div>
    );
  }

  // Get the selected presidents
  const president1 = presidents.find(p => p.name === selectedPresident1) || 
    presidents.find(p => p.isCurrent) || 
    presidents[presidents.length - 1] || 
    { name: 'Unknown', start: '', end: '', isCurrent: true };
  
  const president2 = presidents.find(p => p.name === selectedPresident2) || null;

  // Process data for the selected presidents with days since inauguration and price variation
  const processPresidentialData = (rawData: SP500DataPoint[], startDate: string, endDate: string): DataPointWithVariation[] => {
    const filteredData = rawData.filter(
      point => point.date >= startDate && point.date <= endDate
    );
    
    if (filteredData.length === 0) return [];
    
    const inaugurationDate = new Date(startDate);
    const basePrice = filteredData[0]?.close || 0;
    
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
    
    const startPrice = data[0]?.close || 0;
    const endPrice = data[data.length - 1]?.close || 0;
    const priceChange = endPrice - startPrice;
    const percentChange = (priceChange / startPrice) * 100;
    
    return {
      priceChange: Number(priceChange.toFixed(2)),
      percentChange: Number(percentChange.toFixed(2))
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
          label: function(context: any) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            
            // Get the original data point from our processed data
            const originalData = datasetIndex === 0 && president2Data.length > 0
              ? president2Data[index]
              : president1Data[index];
            
            if (!originalData) return '';
            
            let lines = [];
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
      // @ts-ignore - scale types
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
          callback: function(value: any) {
            return value.toFixed(2) + '%';
          }
        }
      },
    },
  };

  return (
    <div className="w-full p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="president1" className="block text-sm font-medium text-gray-700 mb-1">
              First President
            </label>
            <select 
              id="president1"
              value={selectedPresident1 || ''}
              onChange={(e) => setSelectedPresident1(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a president</option>
              {presidents.map((president) => (
                <option key={president.name} value={president.name}>
                  {president.name} ({president.start.substring(0, 4)}-{president.end.substring(0, 4)})
                </option>
              ))}
            </select>
            {president1Data.length > 0 && (
              <div className="mt-2 text-sm">
                <p>Start: ${president1Data[0]?.close.toFixed(2)}</p>
                <p>End: ${president1Data[president1Data.length - 1]?.close.toFixed(2)}</p>
                <p className={president1Performance.priceChange >= 0 ? "text-green-600" : "text-red-600"}>
                  Change: ${president1Performance.priceChange} ({president1Performance.percentChange}%)
                </p>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <label htmlFor="president2" className="block text-sm font-medium text-gray-700 mb-1">
              Second President
            </label>
            <select 
              id="president2"
              value={selectedPresident2 || ''}
              onChange={(e) => setSelectedPresident2(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a president</option>
              {presidents.map((president) => (
                <option key={president.name} value={president.name}>
                  {president.name} ({president.start.substring(0, 4)}-{president.end.substring(0, 4)})
                </option>
              ))}
            </select>
            {president2Data.length > 0 && (
              <div className="mt-2 text-sm">
                <p>Start: ${president2Data[0]?.close.toFixed(2)}</p>
                <p>End: ${president2Data[president2Data.length - 1]?.close.toFixed(2)}</p>
                <p className={president2Performance.priceChange >= 0 ? "text-green-600" : "text-red-600"}>
                  Change: ${president2Performance.priceChange} ({president2Performance.percentChange}%)
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative h-[60vh] md:h-[70vh]">
          <Line data={chartData} options={chartOptions} ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default SP500Chart; 