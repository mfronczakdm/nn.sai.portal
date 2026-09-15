import type { Field } from '@sitecore-content-sdk/nextjs';
import type { FootprintLocationFields } from './location-search.props';

export type FootprintPinType = 'hq' | 'factory' | 'support';

export interface FootprintMapPoint {
  id: string;
  name: string;
  pinType: FootprintPinType;
  latitude: number;
  longitude: number;
}

export const FOOTPRINT_PIN_COLORS: Record<FootprintPinType, string> = {
  hq: '#D4A017',
  factory: '#2D8B8B',
  support: '#7B3F6B',
};

export const FOOTPRINT_LEGEND_ITEMS: { pinType: FootprintPinType; label: string }[] = [
  { pinType: 'hq', label: 'Corporate Headquarters' },
  { pinType: 'factory', label: 'Factories' },
  { pinType: 'support', label: 'Customer Support Centers' },
];

const getJsonValue = (field?: { jsonValue?: Field<string> }): string =>
  field?.jsonValue?.value?.trim() ?? '';

/** Parses Sitecore GEO text: "latitude,longitude". */
export function parseGeoCoordinates(geo: string): { latitude?: number; longitude?: number } {
  if (!geo.trim()) return {};

  const parts = geo.split(',').map((part) => part.trim());
  if (parts.length < 2) return {};

  const latitude = Number.parseFloat(parts[0]);
  const longitude = Number.parseFloat(parts[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {};
  }

  return { latitude, longitude };
}

export function resolveFootprintPinType(typeValue: string): FootprintPinType {
  const normalized = typeValue.toLowerCase();

  if (normalized.includes('headquarter') || normalized.includes('corporate')) {
    return 'hq';
  }

  if (normalized.includes('factory') || normalized.includes('factories')) {
    return 'factory';
  }

  return 'support';
}

export function mapFootprintItemToPoint(item: FootprintLocationFields): FootprintMapPoint | null {
  const geoText = getJsonValue(item.GEO);
  const { latitude, longitude } = parseGeoCoordinates(geoText);

  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  const name = getJsonValue(item.name) || item.id?.slice(0, 8) || 'Location';
  const pinType = resolveFootprintPinType(getJsonValue(item.locationType));

  return {
    id: item.id ?? name,
    name,
    pinType,
    latitude,
    longitude,
  };
}

export function mapFootprintItemsToPoints(items: FootprintLocationFields[]): FootprintMapPoint[] {
  return items
    .map(mapFootprintItemToPoint)
    .filter((point): point is FootprintMapPoint => point !== null);
}

/** Mercator projection for the static world fallback (percent of map box). */
export function latLngToMapPercent(
  latitude: number,
  longitude: number
): { leftPercent: number; topPercent: number } {
  const clampedLat = Math.max(-85, Math.min(85, latitude));
  const leftPercent = ((longitude + 180) / 360) * 100;
  const latRad = (clampedLat * Math.PI) / 180;
  const mercatorN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const topPercent = ((1 - mercatorN / Math.PI) / 2) * 100;

  return {
    leftPercent: Math.max(1, Math.min(99, leftPercent)),
    topPercent: Math.max(2, Math.min(98, topPercent)),
  };
}

/** Google Maps JSON styles: political globe — land/water only, no streets or POI. */
export const FOOTPRINT_GOOGLE_MAP_STYLES: Array<{
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string | number>>;
}> = [
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'on' }, { color: '#d4d4d0' }, { weight: 0.8 }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#ecece6' }],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#b8d4e8' }],
  },
];

export const FOOTPRINT_GOOGLE_MAP_OPTIONS = {
  center: { lat: 20, lng: 12 },
  zoom: 2,
  minZoom: 2,
  maxZoom: 4,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  gestureHandling: 'cooperative' as const,
  styles: FOOTPRINT_GOOGLE_MAP_STYLES,
};

export function createFootprintPinIcon(pinType: FootprintPinType): string {
  const color = FOOTPRINT_PIN_COLORS[pinType];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C7.4 0 2 5.4 2 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="14" cy="12" r="4" fill="#ffffff"/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
