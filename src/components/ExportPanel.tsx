import { useState } from 'react';
import { usePolygonStore } from '../store/polygonStore';
import { exportToGeoJson, exportToKml } from '../services/kmlExporter';

export function ExportPanel() {
  const features = usePolygonStore((state) => state.features);
  const setUnsavedChanges = usePolygonStore((state) => state.setUnsavedChanges);
  const [format, setFormat] = useState<'kml' | 'geojson'>('kml');

  const handleExport = () => {
    if (features.length === 0) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `polygons-${timestamp}`;

    if (format === 'kml') {
      exportToKml(features, `${filename}.kml`);
    } else {
      exportToGeoJson(features, `${filename}.geojson`);
    }

    setUnsavedChanges(false);
  };

  return (
    <div className="flex flex-col gap-2.5 px-5 pt-3 pb-3 shrink-0">
      <span className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-text-tertiary font-display">
        Export
      </span>
      <div className="flex gap-2">
        <button
          className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold font-body cursor-pointer transition-all duration-200 tracking-wide ${
            format === 'kml'
              ? 'bg-accent-dim text-accent border border-accent/25'
              : 'bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-hover'
          }`}
          onClick={() => setFormat('kml')}
        >
          KML
        </button>
        <button
          className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold font-body cursor-pointer transition-all duration-200 tracking-wide ${
            format === 'geojson'
              ? 'bg-accent-dim text-accent border border-accent/25'
              : 'bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-hover'
          }`}
          onClick={() => setFormat('geojson')}
        >
          GeoJSON
        </button>
      </div>
      <button
        onClick={handleExport}
        disabled={features.length === 0}
        className="glossy-btn-secondary px-4 py-[7px] bg-accent-dim text-accent border border-accent/20 rounded-xl cursor-pointer text-[0.8125rem] font-medium font-body flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M7 1V10M7 10L4 7M7 10L10 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 11V12C1 12.55 1.45 13 2 13H12C12.55 13 13 12.55 13 12V11"
            strokeLinecap="round"
          />
        </svg>
        Download {format.toUpperCase()}
      </button>
    </div>
  );
}
