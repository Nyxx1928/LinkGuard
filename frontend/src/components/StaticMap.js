function buildOsmData(lat, lon) {
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const bbox = `${lonNum - 0.05},${latNum - 0.05},${lonNum + 0.05},${latNum + 0.05}`;

  return {
    iframeUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lonNum}`,
    linkUrl: `https://www.openstreetmap.org/?mlat=${latNum}&mlon=${lonNum}#map=13/${latNum}/${lonNum}`
  };
}

export default function StaticMap({
  lat,
  lon,
  linkLabel = 'View larger map ->',
  containerClassName = 'w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-white/10 shadow-lg relative bg-neutral-950',
  emptyClassName = 'w-full h-64 sm:h-80 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 text-neutral-200 text-sm glass-subtle p-4',
  linkClassName = 'absolute bottom-2 right-2 glass-card text-brand-200 text-xs px-2 py-1 rounded shadow hover:text-brand-100 transition-colors',
  showRetry = false,
  onRetry
}) {
  if (lat == null || lon == null) {
    return (
      <div className={emptyClassName}>
        <span>Interactive map is unavailable in this browser.</span>
        <span className="text-xs text-neutral-400 text-center">Location details are still available above.</span>
      </div>
    );
  }

  const { iframeUrl, linkUrl } = buildOsmData(lat, lon);

  return (
    <div className={containerClassName}>
      <iframe
        title="Location map"
        src={iframeUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
      />
      {showRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="absolute top-2 left-2 glass-card text-neutral-100 text-xs px-2 py-1 rounded border border-white/10 hover:text-white transition-colors"
        >
          Retry interactive map
        </button>
      )}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {linkLabel}
      </a>
    </div>
  );
}
