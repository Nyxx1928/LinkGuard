import { useState, useCallback, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import StaticMap from './StaticMap';
import { Card } from './ui';

// CARTO Dark Matter style for dark theme maps
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function GeoMap({ lat, lon }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [webglSupported] = useState(() => checkWebGL());
  const [mapInstanceKey, setMapInstanceKey] = useState(0);

  const handleMarkerClick = useCallback(() => setPopupOpen((open) => !open), []);
  const handleMapError = useCallback((e) => {
    console.error('Map error:', e);
    setMapError(true);
  }, []);
  const handleRetryMap = useCallback(() => {
    setMapError(false);
    setPopupOpen(false);
    setMapInstanceKey((key) => key + 1);
  }, []);

  useEffect(() => {
    // Reset transient map and popup state when the selected coordinates change.
    setMapError(false);
    setPopupOpen(false);
    setMapInstanceKey((key) => key + 1);
  }, [lat, lon]);

  if (!webglSupported) {
    return <StaticMap lat={lat} lon={lon} />;
  }

  if (mapError) {
    return <StaticMap lat={lat} lon={lon} showRetry onRetry={handleRetryMap} />;
  }

  return (
    <Card variant="default" className="overflow-hidden">
      <div className="w-full h-64 sm:h-80 lg:h-96 relative">
        <Map
          key={mapInstanceKey}
          initialViewState={{ longitude: lon, latitude: lat, zoom: 11 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
          onError={handleMapError}
        >
          <NavigationControl position="top-right" />

          <Marker longitude={lon} latitude={lat} anchor="bottom" onClick={handleMarkerClick}>
            <div className="flex flex-col items-center cursor-pointer group">
              {/* Enhanced marker with brand colors and better visual hierarchy */}
              <div className="relative">
                {/* Pulsing ring animation for emphasis */}
                <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 bg-primary rounded-full opacity-30 animate-ping" />
                
                {/* Main marker pin */}
                <div className="relative w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                  {/* Inner dot */}
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              </div>
              
              {/* Pin stem */}
              <div className="w-0.5 h-3 bg-primary/60" />
            </div>
          </Marker>

          {popupOpen && (
            <Popup
              longitude={lon}
              latitude={lat}
              anchor="top"
              offset={[0, -52]}
              onClose={() => setPopupOpen(false)}
              closeOnClick={false}
              className="rounded-lg"
            >
              <div className="glass-card px-3 py-2 min-w-[140px]">
                <div className="text-xs font-semibold text-neutral-200 mb-1">
                  Location Coordinates
                </div>
                <div className="font-mono text-sm text-primary/80 font-medium">
                  {lat.toFixed(4)}, {lon.toFixed(4)}
                </div>
              </div>
            </Popup>
          )}
        </Map>
        
        {/* Coordinate display overlay - always visible for better UX */}
        <div className="absolute bottom-3 left-3 glass-subtle px-3 py-2 rounded-lg border border-white/10">
          <div className="text-xs text-neutral-300 font-medium mb-0.5">
            Coordinates
          </div>
          <div className="font-mono text-xs text-neutral-100">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </div>
        </div>
      </div>
    </Card>
  );
}
