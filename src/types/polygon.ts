import type { Polygon, MultiPolygon } from 'geojson';

export interface PolygonStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
}

export interface PolygonFeature {
  id: string;
  name: string;
  geometry: Polygon | MultiPolygon;
  properties: {
    name: string;
    description?: string;
    style: PolygonStyle;
  };
}

export const DEFAULT_STYLE: PolygonStyle = {
  fillColor: '#3388ff',
  fillOpacity: 0.3,
  strokeColor: '#3388ff',
  strokeWidth: 3,
};
