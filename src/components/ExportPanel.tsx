import { useState } from 'react';
import { usePolygonStore } from '../store/polygonStore';
import { exportToGeoJson, exportToKml } from '../services/kmlExporter';

export function ExportPanel() {
  const features = usePolygonStore((state) => state.features);
  const setUnsavedChanges = usePolygonStore((state) => state.setUnsavedChanges);
  const [format, setFormat] = useState<'kml' | 'geojson'>('kml');

  const handleExport = () => {
    if (features.length === 0) {
      alert('No polygons to export');
      return;
    }

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
    <div className="export-panel">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as 'kml' | 'geojson')}
        className="format-select"
      >
        <option value="kml">KML</option>
        <option value="geojson">GeoJSON</option>
      </select>
      <button
        onClick={handleExport}
        disabled={features.length === 0}
        className="export-btn"
      >
        Export
      </button>
    </div>
  );
}
