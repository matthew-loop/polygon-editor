import type { Polygon, Position } from 'geojson';
import { polygon as turfPolygon, lineString, featureCollection } from '@turf/helpers';
import intersect from '@turf/intersect';
import lineIntersect from '@turf/line-intersect';
import polygonToLine from '@turf/polygon-to-line';
import bbox from '@turf/bbox';

export type SplitResult = {
  success: true;
  polygons: Polygon[];
} | {
  success: false;
  error: string;
}

/**
 * Split a polygon into two (or more) pieces using a cutting line.
 * Uses half-plane intersection: extend the line, create two large rectangles
 * on each side, intersect with the original polygon.
 */
export function splitPolygon(polygon: Polygon, cuttingLine: Position[]): SplitResult {
  if (cuttingLine.length < 2) {
    return { success: false, error: 'Cutting line must have at least 2 points' };
  }

  try {
    // Find intersection points between cutting line and polygon boundary
    const polyLine = polygonToLine(turfPolygon(polygon.coordinates));
    const cutLine = lineString(cuttingLine);
    const intersections = lineIntersect(polyLine, cutLine);

    if (intersections.features.length < 2) {
      return { success: false, error: 'Line must cross the polygon at least twice' };
    }

    // Get polygon bbox and compute padding
    const [minX, minY, maxX, maxY] = bbox(turfPolygon(polygon.coordinates));
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 2 * Math.max(width, height);

    // Extend cutting line endpoints
    const first = cuttingLine[0];
    const second = cuttingLine[1];
    const last = cuttingLine[cuttingLine.length - 1];
    const secondToLast = cuttingLine[cuttingLine.length - 2];

    // Direction vectors for extension
    const startDx = first[0] - second[0];
    const startDy = first[1] - second[1];
    const startLen = Math.sqrt(startDx * startDx + startDy * startDy);

    const endDx = last[0] - secondToLast[0];
    const endDy = last[1] - secondToLast[1];
    const endLen = Math.sqrt(endDx * endDx + endDy * endDy);

    const extendedStart: Position = [
      first[0] + (startDx / startLen) * padding,
      first[1] + (startDy / startLen) * padding,
    ];
    const extendedEnd: Position = [
      last[0] + (endDx / endLen) * padding,
      last[1] + (endDy / endLen) * padding,
    ];

    // Build extended cutting line (with all intermediate points)
    const extendedLine: Position[] = [extendedStart, ...cuttingLine, extendedEnd];

    // Compute perpendicular offset vector
    // Use overall line direction for perpendicular
    const overallDx = extendedEnd[0] - extendedStart[0];
    const overallDy = extendedEnd[1] - extendedStart[1];
    const overallLen = Math.sqrt(overallDx * overallDx + overallDy * overallDy);
    const perpX = (-overallDy / overallLen) * padding;
    const perpY = (overallDx / overallLen) * padding;

    // Build two half-plane polygons
    const sideA: Position[] = [
      ...extendedLine,
      ...extendedLine.slice().reverse().map(([x, y]) => [x + perpX, y + perpY] as Position),
    ];
    sideA.push(sideA[0]); // close ring

    const sideB: Position[] = [
      ...extendedLine,
      ...extendedLine.slice().reverse().map(([x, y]) => [x - perpX, y - perpY] as Position),
    ];
    sideB.push(sideB[0]); // close ring

    const resultPolygons: Polygon[] = [];

    for (const halfPlane of [sideA, sideB]) {
      const result = intersect(
        featureCollection([
          turfPolygon(polygon.coordinates),
          turfPolygon([halfPlane]),
        ])
      );

      if (!result) continue;

      if (result.geometry.type === 'Polygon') {
        if (result.geometry.coordinates[0].length >= 4) {
          resultPolygons.push(result.geometry);
        }
      } else if (result.geometry.type === 'MultiPolygon') {
        for (const coords of result.geometry.coordinates) {
          if (coords[0].length >= 4) {
            resultPolygons.push({ type: 'Polygon', coordinates: coords });
          }
        }
      }
    }

    if (resultPolygons.length < 2) {
      return { success: false, error: 'Line did not split the polygon into multiple parts' };
    }

    return { success: true, polygons: resultPolygons };
  } catch (e) {
    return { success: false, error: `Split failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
