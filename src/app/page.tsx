import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";
import SP500Chart from './_components/SP500Chart';
import DataUpdater from './_components/DataUpdater';

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gray-50">
        <h1 className="text-4xl font-bold mb-2">S&P 500 Presidential Tracker</h1>
        <p className="text-gray-600 mb-8">Compare S&P 500 performance during different presidential terms</p>
        
        <div className="w-full max-w-7xl mb-8">
          <DataUpdater />
        </div>
        
        <div className="w-full max-w-7xl">
          <SP500Chart />
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">About This Tool</h2>
          <p className="mb-4">
            This application visualizes the S&P 500 index performance during different U.S. presidential terms. 
            By default, it shows a comparison between the current president and the previous one.
          </p>
          <p className="mb-4">
            You can select any two presidents to compare their terms side by side and see key performance 
            metrics including price change and percentage change during their time in office.
          </p>
          <p>
            The data is fetched from Yahoo Finance and updated daily. Use the Data Management section above to initialize 
            or update the S&P 500 data.
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
