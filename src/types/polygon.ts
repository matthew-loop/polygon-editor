import type { Polygon } from 'geojson';

export interface PolygonStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
}

export interface PolygonFeature {
  id: string;
  name: string;
  geometry: Polygon;
  groupId?: string;
  properties: {
    description?: string;
    style: PolygonStyle;
  };
}

export interface PolygonGroup {
  id: string;
  name: string;
}

export const DEFAULT_STYLE: PolygonStyle = {
  fillColor: '#4f46e5',
  fillOpacity: 0.2,
  strokeColor: '#4f46e5',
  strokeWidth: 2,
};
