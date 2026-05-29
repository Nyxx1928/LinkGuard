import React from 'react';
import { Card, Skeleton } from './ui';

const AnalysisResultSkeleton = () => {
  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} variant="subtle" padding="md" className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </Card>
        ))}
      </div>

      <Card variant="subtle" padding="md" className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full" />
      </Card>
    </div>
  );
};

export default AnalysisResultSkeleton;
