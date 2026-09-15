import {
  boundsFromPoints,
  buildOsmView,
  latToWorldY,
  lngToWorldX,
  osmTileUrl,
  parseCoordinate,
  zoomForBounds,
} from '@/lib/location-listing-map.utils';

describe('parseCoordinate', () => {
  it('parses latitude and longitude strings', () => {
    expect(parseCoordinate('29.9967')).toBeCloseTo(29.9967);
    expect(parseCoordinate(' -90.1526 ')).toBeCloseTo(-90.1526);
  });

  it('rejects empty or non-numeric values', () => {
    expect(parseCoordinate('')).toBeUndefined();
    expect(parseCoordinate('abc')).toBeUndefined();
    expect(parseCoordinate(undefined)).toBeUndefined();
  });
});

describe('buildOsmView', () => {
  const eastJefferson = { id: 'ejgh', latitude: 29.9967, longitude: -90.1526 };
  const touro = { id: 'touro', latitude: 29.9258, longitude: -90.0928 };

  it('fits New Orleans pins onto OSM tiles without Google', () => {
    const view = buildOsmView([eastJefferson, touro], 800, 420);
    expect(view).not.toBeNull();
    expect(view?.tiles.length).toBeGreaterThan(0);
    expect(view?.pins).toHaveLength(2);
    expect(view?.tiles[0]).toEqual(
      expect.objectContaining({
        z: expect.any(Number),
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
    expect(osmTileUrl(11, 523, 841)).toBe('https://tile.openstreetmap.org/11/523/841.png');
    expect(osmTileUrl(11, 523, 841)).not.toContain('google');
  });

  it('places a more northern pin higher on the map', () => {
    const view = buildOsmView([eastJefferson, touro], 800, 420);
    const north = view?.pins.find((pin) => pin.id === 'ejgh');
    const south = view?.pins.find((pin) => pin.id === 'touro');
    expect(north && south).toBeTruthy();
    expect(north!.top).toBeLessThan(south!.top);
  });

  it('returns null when there are no points', () => {
    expect(buildOsmView([], 800, 420)).toBeNull();
  });
});

describe('bounds and projection helpers', () => {
  it('pads a single point so the map has a visible area', () => {
    const bounds = boundsFromPoints([{ id: 'one', latitude: 29.95, longitude: -90.07 }]);
    expect(bounds).toEqual(
      expect.objectContaining({
        minLat: expect.any(Number),
        maxLat: expect.any(Number),
        minLng: expect.any(Number),
        maxLng: expect.any(Number),
      })
    );
    expect(bounds!.maxLat).toBeGreaterThan(bounds!.minLat);
    expect(bounds!.maxLng).toBeGreaterThan(bounds!.minLng);
  });

  it('chooses a zoom that fits the bounding box', () => {
    const bounds = boundsFromPoints([
      { id: 'a', latitude: 29.9, longitude: -90.2 },
      { id: 'b', latitude: 30.05, longitude: -89.95 },
    ]);
    expect(bounds).not.toBeNull();
    const zoom = zoomForBounds(bounds!, 800, 420);
    expect(zoom).toBeGreaterThanOrEqual(8);
    expect(zoom).toBeLessThanOrEqual(16);
    expect(lngToWorldX(-90, zoom)).toBeGreaterThan(0);
    expect(latToWorldY(30, zoom)).toBeGreaterThan(0);
  });
});
