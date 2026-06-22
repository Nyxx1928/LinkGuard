import React, { Suspense } from 'react';

const GeoMap = React.lazy(() => import('./GeoMap'));

const LazyGeoMap = (props) => {
  return (
    <Suspense
      fallback={(
        <div className="bg-surface h-64 w-full rounded-md border hairline flex items-center justify-center text-sm text-body">
          Loading map...
        </div>
      )}
    >
      <GeoMap {...props} />
    </Suspense>
  );
};

export default LazyGeoMap;
