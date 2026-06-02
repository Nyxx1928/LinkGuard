import React, { Suspense } from 'react';

const GeoMap = React.lazy(() => import('./GeoMap'));

const LazyGeoMap = (props) => {
  return (
    <Suspense
      fallback={(
        <div className="glass-subtle h-64 w-full rounded-xl border border-white/10 flex items-center justify-center text-sm text-muted-foreground">
          Loading map...
        </div>
      )}
    >
      <GeoMap {...props} />
    </Suspense>
  );
};

export default LazyGeoMap;
