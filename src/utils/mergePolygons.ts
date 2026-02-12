import type { Polygon } from 'geojson';
import { polygon as turfPolygon, featureCollection } from '@turf/helpers';
import union from '@turf/union';

export type MergeResult = {
  success: true;
  geometry: Polygon;
} | {
  success: false;
  error: string;
}

/**
 * Merge multiple polygons into a single polygon using geometric union.
 * Rejects results that produce a MultiPolygon (non-adjacent polygons).
 */
export function mergePolygons(polygons: Polygon[]): MergeResult {
  if (polygons.length < 2) {
    return { success: false, error: 'Need at least 2 polygons to merge' };
  }

  try {
    const turfFeatures = polygons.map((p) => turfPolygon(p.coordinates));
    const result = union(featureCollection(turfFeatures));

    if (!result) {
      return { success: false, error: 'Union operation failed' };
    }

    if (result.geometry.type === 'MultiPolygon') {
      return {
        success: false,
        error: 'Polygons must overlap or touch to merge. Non-adjacent polygons cannot be combined.',
      };
    }

    return { success: true, geometry: result.geometry as Polygon };
  } catch (e) {
    return { success: false, error: `Merge failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
