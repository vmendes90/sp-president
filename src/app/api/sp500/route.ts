import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the data structure
interface SP500DataPoint {
  date: string;
  close: number;
}

// Path to the data file
const dataFilePath = path.join(process.cwd(), 'src/data/sp500_data.json');

export async function GET() {
  try {
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    // Read the data file
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')) as SP500DataPoint[];

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error serving S&P 500 data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve S&P 500 data' },
      { status: 500 }
    );
  }
} 