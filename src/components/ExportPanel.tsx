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
    <div className="flex flex-col gap-2.5 px-5 pt-3 pb-2 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-text-secondary">Export</span>
      </div>
      <div className="flex bg-bg-surface rounded-sm p-[3px] gap-[3px]">
        <button
          className={`flex-1 px-3 py-1.5 border-none rounded text-xs font-semibold font-body cursor-pointer transition-all duration-200 tracking-wide ${
            format === 'kml'
              ? 'bg-bg-elevated text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'bg-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setFormat('kml')}
        >
          KML
        </button>
        <button
          className={`flex-1 px-3 py-1.5 border-none rounded text-xs font-semibold font-body cursor-pointer transition-all duration-200 tracking-wide ${
            format === 'geojson'
              ? 'bg-bg-elevated text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'bg-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setFormat('geojson')}
        >
          GeoJSON
        </button>
      </div>
      <button
        onClick={handleExport}
        disabled={features.length === 0}
        className="px-4 py-2 bg-success-dim text-success border border-[rgba(5,150,105,0.2)] rounded-sm cursor-pointer text-[0.8125rem] font-medium font-body transition-all duration-200 flex items-center justify-center gap-2 hover:not-disabled:bg-[rgba(5,150,105,0.16)] hover:not-disabled:border-[rgba(5,150,105,0.35)] active:not-disabled:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed"
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
        Download
      </button>
    </div>
  );
}
