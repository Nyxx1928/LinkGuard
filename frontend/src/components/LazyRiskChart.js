import React, { Suspense } from 'react';
import { Skeleton } from './ui';

const RiskChart = React.lazy(() => import('./RiskChart'));

const LazyRiskChart = (props) => {
  return (
    <Suspense fallback={<Skeleton className="h-60 w-full" />}>
      <RiskChart {...props} />
    </Suspense>
  );
};

export default LazyRiskChart;
