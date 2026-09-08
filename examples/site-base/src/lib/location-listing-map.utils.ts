export const OSM_TILE_SIZE = 256;
export const OSM_MIN_ZOOM = 8;
export const OSM_MAX_ZOOM = 16;

export type GeoPoint = {
  id: string;
  latitude: number;
  longitude: number;
};

export type GeoBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type OsmTile = {
  z: number;
  x: number;
  y: number;
  left: number;
  top: number;
};

export type OsmPin = {
  id: string;
  left: number;
  top: number;
};

export type OsmMapView = {
  tiles: OsmTile[];
  pins: OsmPin[];
  width: number;
  height: number;
  zoom: number;
};

export function parseCoordinate(value?: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function boundsFromPoints(points: GeoPoint[], paddingRatio = 0.18): GeoBounds | null {
  if (!points.length) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const point of points) {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  }

  const latPad = Math.max((maxLat - minLat) * paddingRatio, 0.04);
  const lngPad = Math.max((maxLng - minLng) * paddingRatio, 0.04);

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

export function lngToWorldX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * OSM_TILE_SIZE * 2 ** zoom;
}

export function latToWorldY(lat: number, zoom: number): number {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sinLat = Math.sin((clamped * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
  return y * OSM_TILE_SIZE * 2 ** zoom;
}

export function zoomForBounds(bounds: GeoBounds, width: number, height: number): number {
  for (let zoom = OSM_MAX_ZOOM; zoom >= OSM_MIN_ZOOM; zoom -= 1) {
    const worldWidth = lngToWorldX(bounds.maxLng, zoom) - lngToWorldX(bounds.minLng, zoom);
    const worldHeight = latToWorldY(bounds.minLat, zoom) - latToWorldY(bounds.maxLat, zoom);
    if (worldWidth <= width && worldHeight <= height) return zoom;
  }
  return OSM_MIN_ZOOM;
}

export function osmTileUrl(z: number, x: number, y: number): string {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export function buildOsmView(
  points: GeoPoint[],
  width: number,
  height: number
): OsmMapView | null {
  const bounds = boundsFromPoints(points);
  if (!bounds || width < 1 || height < 1) return null;

  const zoom = zoomForBounds(bounds, width, height);
  const minX = lngToWorldX(bounds.minLng, zoom);
  const maxX = lngToWorldX(bounds.maxLng, zoom);
  const minY = latToWorldY(bounds.maxLat, zoom);
  const maxY = latToWorldY(bounds.minLat, zoom);
  const originX = minX - (width - (maxX - minX)) / 2;
  const originY = minY - (height - (maxY - minY)) / 2;
  const tileCount = 2 ** zoom;

  const tileMinX = Math.floor(originX / OSM_TILE_SIZE);
  const tileMaxX = Math.floor((originX + width - 1) / OSM_TILE_SIZE);
  const tileMinY = Math.floor(originY / OSM_TILE_SIZE);
  const tileMaxY = Math.floor((originY + height - 1) / OSM_TILE_SIZE);

  const tiles: OsmTile[] = [];
  for (let x = tileMinX; x <= tileMaxX; x += 1) {
    for (let y = tileMinY; y <= tileMaxY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      tiles.push({
        z: zoom,
        x: wrappedX,
        y,
        left: x * OSM_TILE_SIZE - originX,
        top: y * OSM_TILE_SIZE - originY,
      });
    }
  }

  const pins = points.map((point) => ({
    id: point.id,
    left: lngToWorldX(point.longitude, zoom) - originX,
    top: latToWorldY(point.latitude, zoom) - originY,
  }));

  return { tiles, pins, width, height, zoom };
}
