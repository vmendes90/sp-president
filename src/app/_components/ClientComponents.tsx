'use client';

import dynamic from 'next/dynamic';

// Use dynamic imports with ssr:false to only render chart components on the client
const SP500Chart = dynamic(() => import('./SP500Chart'), { ssr: false });
const PerformanceSummary = dynamic(() => import('./PerformanceSummary'), { ssr: false });

export function ChartSection() {
  return (
    <>
      <div className="w-full max-w-7xl mb-12">
        <SP500Chart />
      </div>
      
      <div className="w-full max-w-7xl mb-12">
        <PerformanceSummary />
      </div>
    </>
  );
} 