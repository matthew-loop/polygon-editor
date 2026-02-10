import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePolygonStore } from '../../store/polygonStore';

export function MapBoundsHandler() {
  const map = useMap();
  const features = usePolygonStore((state) => state.features);
  const prevFeaturesLength = useRef(0);

  useEffect(() => {
    // Only fit bounds when features are first loaded (not on every change)
    if (features.length > 0 && prevFeaturesLength.current === 0) {
      const bounds = L.latLngBounds([]);

      features.forEach((feature) => {
        const coords = feature.geometry.type === 'Polygon'
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates.flat(1);

        coords.forEach((coord) => {
          // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
          bounds.extend([coord[1] as number, coord[0] as number]);
        });
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    prevFeaturesLength.current = features.length;
  }, [features, map]);

  return null;
}
