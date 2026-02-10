import { Polygon, Tooltip } from 'react-leaflet';
import { usePolygonStore } from '../../store/polygonStore';
import type { LatLngExpression } from 'leaflet';

export function PolygonLayer() {
  const features = usePolygonStore((state) => state.features);
  const selectedFeatureId = usePolygonStore((state) => state.selectedFeatureId);
  const selectFeature = usePolygonStore((state) => state.selectFeature);

  return (
    <>
      {features.map((feature) => {
        const isSelected = feature.id === selectedFeatureId;
        const { style } = feature.properties;

        // Convert GeoJSON coordinates to Leaflet format
        // GeoJSON: [lng, lat], Leaflet: [lat, lng]
        const positions: LatLngExpression[][] =
          feature.geometry.type === 'Polygon'
            ? feature.geometry.coordinates.map((ring) =>
                ring.map(([lng, lat]) => [lat, lng] as LatLngExpression)
              )
            : feature.geometry.coordinates.flatMap((polygon) =>
                polygon.map((ring) =>
                  ring.map(([lng, lat]) => [lat, lng] as LatLngExpression)
                )
              );

        return (
          <Polygon
            key={feature.id}
            positions={positions}
            pathOptions={{
              fillColor: style.fillColor,
              fillOpacity: isSelected ? 0.5 : style.fillOpacity,
              color: isSelected ? '#ff7800' : style.strokeColor,
              weight: isSelected ? 4 : style.strokeWidth,
            }}
            eventHandlers={{
              click: () => selectFeature(feature.id),
            }}
          >
            <Tooltip sticky>{feature.name}</Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
