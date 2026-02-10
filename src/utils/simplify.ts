import type { Polygon, MultiPolygon, Position } from 'geojson';

function perpendicularDistance(
  point: Position,
  lineStart: Position,
  lineEnd: Position
): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const ex = point[0] - lineStart[0];
    const ey = point[1] - lineStart[1];
    return Math.sqrt(ex * ex + ey * ey);
  }

  const area = Math.abs(
    dy * point[0] - dx * point[1] + lineEnd[0] * lineStart[1] - lineEnd[1] * lineStart[0]
  );
  return area / Math.sqrt(lengthSq);
}

function rdpSimplify(points: Position[], epsilon: number): Position[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[points.length - 1]];
}

function simplifyRing(ring: Position[], epsilon: number): Position[] {
  if (ring.length <= 4) return ring;

  // Simplify without the closing point, then re-close
  const open = ring.slice(0, -1);
  const simplified = rdpSimplify(open, epsilon);

  // Ensure minimum 3 unique points for a valid ring
  if (simplified.length < 3) return ring;

  return [...simplified, simplified[0]];
}

export function simplifyPolygonGeometry(
  geometry: Polygon | MultiPolygon,
  epsilon: number
): Polygon | MultiPolygon {
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, epsilon)),
    };
  }

  return {
    type: 'MultiPolygon',
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map((ring) => simplifyRing(ring, epsilon))
    ),
  };
}

export function countPoints(geometry: Polygon | MultiPolygon): number {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
  }

  return geometry.coordinates.reduce(
    (sum, polygon) =>
      sum + polygon.reduce((pSum, ring) => pSum + ring.length, 0),
    0
  );
}
