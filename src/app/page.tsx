'use client';

import { TRPCReactProvider } from "~/trpc/react";
import { ChartSection } from './_components/ClientComponents';

export default function Home() {
  return (
    <TRPCReactProvider>
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl md:text-5xl">
              S&P 500 Presidential Tracker
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg md:text-xl">
              Compare S&P 500 performance during different presidential terms
            </p>
          </header>
          
          {/*<div className="mb-8 w-full">
            <DataUpdater />
          </div>*/ } 
          
          <ChartSection />
          
          <div className="mx-auto mt-12 max-w-3xl rounded-xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold text-primary-800">About This Tool</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                This application visualizes the S&P 500 index performance during different U.S. presidential terms. 
                By default, it shows a comparison between the current president and the previous one.
              </p>
              <p>
                You can select any two presidents to compare their terms side by side and see key performance 
                metrics including price change and percentage change during their time in office.
              </p>
              <p>
                The data is fetched from Yahoo Finance and updated daily. 
              </p>
            </div>
          </div>
        </div>
      </main>
    </TRPCReactProvider>
  );
}
