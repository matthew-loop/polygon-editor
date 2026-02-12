import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePolygonStore } from '../../store/polygonStore';

export function MapBoundsHandler() {
  const map = useMap();
  const features = usePolygonStore((state) => state.features);
  const selectedFeatureId = usePolygonStore((state) => state.selectedFeatureId);
  const editingFeatureId = usePolygonStore((state) => state.editingFeatureId);
  const prevFeaturesLength = useRef(0);

  // Fit bounds when features are first loaded
  useEffect(() => {
    const prevLength = prevFeaturesLength.current;
    if (features.length > 0 && (prevLength === 0 || features.length - prevLength > 1)) {
      const geoJsonLayer = L.geoJSON(
        features.map((f) => ({
          type: 'Feature' as const,
          geometry: f.geometry,
          properties: {},
        }))
      );

      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    prevFeaturesLength.current = features.length;
  }, [features, map]);

  // Fly to selected polygon
  useEffect(() => {
    if (!selectedFeatureId || editingFeatureId) return;
    const feature = features.find((f) => f.id === selectedFeatureId);
    if (!feature) return;

    const geoJsonLayer = L.geoJSON(feature.geometry as unknown as GeoJSON.GeoJsonObject);
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      const currentZoom = map.getZoom();
      map.flyToBounds(bounds, { paddingTopLeft: [400, 80], paddingBottomRight: [80, 80], maxZoom: Math.max(13, currentZoom) });
    }
  }, [selectedFeatureId, editingFeatureId, features, map]);

  return null;
}
