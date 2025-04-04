import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the President interface
interface President {
  name: string;
  start: string;
  end: string;
  isCurrent: boolean;
}

// Path to the data file
const dataFilePath = path.join(process.cwd(), 'src/data/presidents.json');

export async function GET() {
  try {
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    // Read the data file and properly type it
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')) as President[];

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error serving presidential data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve presidential data' },
      { status: 500 }
    );
  }
} 