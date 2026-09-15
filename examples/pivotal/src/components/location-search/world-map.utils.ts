import { WORLD_LAND_RINGS, type LandRing } from './world-land.data';

/** Longitude at the horizontal centre of the map (Pacific-centred, matches amkor.com). */
export const MAP_CENTER_LONGITUDE = 150;

/** Web-Mercator world square: full 360 degrees of longitude across this width. */
export const MAP_VIEW_WIDTH = 1000;

/** Vertical crop of the Mercator square, in degrees of latitude. */
export const MAP_LATITUDE_TOP = 72;
export const MAP_LATITUDE_BOTTOM = -55;

const MAX_MERCATOR_LATITUDE = 84;

const shiftLongitude = (longitude: number, centerLongitude: number): number => {
  const shifted = (((longitude - centerLongitude + 180) % 360) + 360) % 360;
  return shifted - 180;
};

const mercatorY = (latitude: number): number => {
  const clamped = Math.max(-MAX_MERCATOR_LATITUDE, Math.min(MAX_MERCATOR_LATITUDE, latitude));
  const latitudeRadians = (clamped * Math.PI) / 180;
  const projected = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
  return (MAP_VIEW_WIDTH / (2 * Math.PI)) * (Math.PI - projected);
};

export const MAP_VIEW_TOP = mercatorY(MAP_LATITUDE_TOP);
export const MAP_VIEW_HEIGHT = mercatorY(MAP_LATITUDE_BOTTOM) - MAP_VIEW_TOP;

/** Projects a coordinate into the cropped Mercator view box. */
export function projectToMapView(
  latitude: number,
  longitude: number,
  centerLongitude: number = MAP_CENTER_LONGITUDE
): { x: number; y: number } {
  const shifted = shiftLongitude(longitude, centerLongitude);

  return {
    x: ((shifted + 180) / 360) * MAP_VIEW_WIDTH,
    y: mercatorY(latitude) - MAP_VIEW_TOP,
  };
}

const formatPoint = (x: number, y: number): string => `${x.toFixed(1)},${y.toFixed(1)}`;

/**
 * Builds SVG path data for the land rings. Rings that cross the map's cut meridian
 * are split into separate subpaths so they do not smear across the whole map.
 */
export function buildLandPathData(
  rings: LandRing[] = WORLD_LAND_RINGS,
  centerLongitude: number = MAP_CENTER_LONGITUDE
): string {
  const subpaths: string[] = [];

  for (const ring of rings) {
    let current: string[] = [];
    let previous: { x: number; y: number } | null = null;

    for (const [longitude, latitude] of ring) {
      const { x, y } = projectToMapView(latitude, longitude, centerLongitude);
      const exitsLeft = previous !== null && x - previous.x > MAP_VIEW_WIDTH / 2;
      const exitsRight = previous !== null && previous.x - x > MAP_VIEW_WIDTH / 2;

      if (previous && (exitsLeft || exitsRight)) {
        // The ring wraps around the cut meridian: close it on one edge and
        // resume it on the opposite edge at the same height.
        const unwrappedX = exitsLeft ? x - MAP_VIEW_WIDTH : x + MAP_VIEW_WIDTH;
        const exitX = exitsLeft ? 0 : MAP_VIEW_WIDTH;
        const ratio = (exitX - previous.x) / (unwrappedX - previous.x);
        const edgeY = previous.y + ratio * (y - previous.y);

        current.push(formatPoint(exitX, edgeY));
        if (current.length > 2) {
          subpaths.push(`M${current.join('L')}Z`);
        }
        current = [formatPoint(MAP_VIEW_WIDTH - exitX, edgeY)];
      }

      current.push(formatPoint(x, y));
      previous = { x, y };
    }

    if (current.length > 2) {
      subpaths.push(`M${current.join('L')}Z`);
    }
  }

  return subpaths.join('');
}
