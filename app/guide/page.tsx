import { GuideDashboard } from '@/components/guide-dashboard';

export const metadata = {
  title: 'Guide Mode - ContriboScope',
  description: 'AI-generated Contribution Roadmap for GitHub Issues',
};

import { Suspense } from 'react';

export default function GuidePage() {
  return (
    <div className="container py-12 lg:py-16">
      <div className="max-w-3xl mx-auto space-y-4 mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Contribution Guide
        </h1>
        <p className="text-xl text-muted-foreground">
          Turn daunting GitHub issues into actionable, beginner-friendly roadmaps.
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading guide engine...</p>
        </div>
      }>
        <GuideDashboard />
      </Suspense>
    </div>
  );
}
