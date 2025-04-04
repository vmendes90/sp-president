'use client';

import dynamic from 'next/dynamic';

// Use dynamic imports with ssr:false to only render chart components on the client
const SP500Chart = dynamic(() => import('./SP500Chart'), { ssr: false });
const PerformanceSummary = dynamic(() => import('./PerformanceSummary'), { ssr: false });

export function ChartSection() {
  return (
    <div className="space-y-12">
      <section className="w-full overflow-hidden rounded-xl bg-white p-4 shadow-md sm:p-6">
        <SP500Chart />
      </section>
      
      <section className="w-full overflow-hidden rounded-xl bg-white shadow-md">
        <PerformanceSummary />
      </section>
    </div>
  );
} 