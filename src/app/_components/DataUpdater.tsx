'use client';

import { useState } from 'react';

const DataUpdater = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateData = async (mode: 'latest' | 'historical') => {
    try {
      setIsLoading(true);
      setMessage(null);
      setError(null);

      const endpoint = mode === 'historical' 
        ? '/api/update-sp500?mode=historical' 
        : '/api/update-sp500';
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to update data: ${response.statusText}`);
      }
      
      const data = await response.json() as { message: string };
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Data Management</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <button
          onClick={() => updateData('latest')}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? 'Updating...' : 'Update with Latest Data'}
        </button>
        
        <button
          onClick={() => updateData('historical')}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
        >
          {isLoading ? 'Fetching...' : 'Fetch All Historical Data'}
        </button>
      </div>
      
      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded mb-3">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded mb-3">
          Error: {error}
        </div>
      )}
      
      <p className="text-sm text-gray-600">
        <strong>Note:</strong> Fetching all historical data may take a moment. Please be patient.
      </p>
    </div>
  );
};

export default DataUpdater; 