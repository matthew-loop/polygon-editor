import { kml } from '@tmcw/togeojson';
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import type { PolygonFeature, PolygonStyle } from '../types/polygon';
import { DEFAULT_STYLE } from '../types/polygon';

function extractStyle(properties: Record<string, unknown> | null): PolygonStyle {
  if (!properties) return { ...DEFAULT_STYLE };

  return {
    fillColor: (properties.fill as string) || DEFAULT_STYLE.fillColor,
    fillOpacity: (properties['fill-opacity'] as number) ?? DEFAULT_STYLE.fillOpacity,
    strokeColor: (properties.stroke as string) || DEFAULT_STYLE.strokeColor,
    strokeWidth: (properties['stroke-width'] as number) ?? DEFAULT_STYLE.strokeWidth,
  };
}

function flattenFeature(feature: Feature<Polygon | MultiPolygon>): Feature<Polygon>[] {
  if (feature.geometry.type === 'Polygon') {
    return [feature as Feature<Polygon>];
  }

  // MultiPolygon: split into individual polygons
  return feature.geometry.coordinates.map((coords, index) => ({
    ...feature,
    geometry: {
      type: 'Polygon' as const,
      coordinates: coords,
    },
    properties: {
      ...feature.properties,
      name: feature.properties?.name
        ? `${feature.properties.name} (${index + 1})`
        : `Polygon ${index + 1}`,
    },
  }));
}

export async function parseKmlFile(file: File): Promise<PolygonFeature[]> {
  const text = await file.text();
  const dom = new DOMParser().parseFromString(text, 'text/xml');
  const geojson = kml(dom) as FeatureCollection;

  const polygonFeatures: PolygonFeature[] = [];

  geojson.features.forEach((feature) => {
    const geomType = feature.geometry?.type;
    if (geomType !== 'Polygon' && geomType !== 'MultiPolygon') {
      return;
    }

    const flattened = flattenFeature(feature as Feature<Polygon | MultiPolygon>);

    flattened.forEach((f) => {
      const name = (f.properties?.name as string) || 'Unnamed Polygon';
      const style = extractStyle(f.properties);

      polygonFeatures.push({
        id: crypto.randomUUID(),
        name,
        geometry: f.geometry,
        properties: {
          name,
          description: f.properties?.description as string | undefined,
          style,
        },
      });
    });
  });

  return polygonFeatures;
}
