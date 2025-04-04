import * as fs from 'fs';
import * as path from 'path';
import yahooFinance from 'yahoo-finance2';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the data file
const dataFilePath = path.join(__dirname, '../data/sp500_data.json');

interface SP500DataPoint {
  date: string;
  close: number;
}

export async function fetchHistoricalSP500Data() {
  try {
    // For historical data, we'll fetch as much as we can
    const result = await yahooFinance.historical('^GSPC', {
      period1: '1927-01-01', // Starting from around when we have presidential data
      period2: new Date().toISOString().split('T')[0], // Today
      interval: '1d', // Daily data
    });

    // Transform the data to our desired format
    const formattedData: SP500DataPoint[] = result.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      close: Number(item.close.toFixed(2)),
    }));

    // Save the data to our JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(formattedData, null, 2));
    
    console.log(`Successfully fetched and saved ${formattedData.length} data points.`);
    return formattedData;
  } catch (error) {
    console.error('Error fetching S&P 500 data:', error);
    throw error;
  }
}

export async function fetchLatestSP500Data() {
  try {
    // First check if the file exists, if not create it
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
    }

    // Read the existing data
    const existingData: SP500DataPoint[] = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    
    // Get the latest data point date
    let latestDate = '1927-01-01';
    if (existingData.length > 0) {
      latestDate = existingData[existingData.length - 1].date;
    }

    // Format date to compare with today
    const today = new Date().toISOString().split('T')[0];
    
    // If we already have today's data, no need to fetch
    if (latestDate === today) {
      console.log('Data is already up to date.');
      return existingData;
    }

    // Get new data from the day after our latest data
    const nextDay = new Date(latestDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const result = await yahooFinance.historical('^GSPC', {
      period1: nextDay.toISOString().split('T')[0],
      period2: today,
      interval: '1d',
    });

    // Transform and add the new data
    const newDataPoints: SP500DataPoint[] = result.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      close: Number(item.close.toFixed(2)),
    }));

    // Combine with existing data and save
    const updatedData = [...existingData, ...newDataPoints];
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));
    
    console.log(`Successfully updated with ${newDataPoints.length} new data points.`);
    return updatedData;
  } catch (error) {
    console.error('Error updating S&P 500 data:', error);
    throw error;
  }
} 