import tokml from 'tokml';
import type { FeatureCollection, Feature } from 'geojson';
import type { PolygonFeature } from '../types/polygon';
import { downloadFile } from './fileDownload';

export function exportToGeoJson(features: PolygonFeature[], filename: string = 'polygons.geojson') {
  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map((f): Feature => ({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        name: f.name,
        description: f.properties.description,
        fill: f.properties.style.fillColor,
        'fill-opacity': f.properties.style.fillOpacity,
        stroke: f.properties.style.strokeColor,
        'stroke-width': f.properties.style.strokeWidth,
      },
    })),
  };

  const content = JSON.stringify(featureCollection, null, 2);
  downloadFile(content, filename, 'application/geo+json');
}

export function exportToKml(features: PolygonFeature[], filename: string = 'polygons.kml') {
  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features.map((f): Feature => ({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        name: f.name,
        description: f.properties.description || '',
      },
    })),
  };

  const kmlContent = tokml(featureCollection, {
    name: 'name',
    description: 'description',
  });

  downloadFile(kmlContent, filename, 'application/vnd.google-earth.kml+xml');
}
