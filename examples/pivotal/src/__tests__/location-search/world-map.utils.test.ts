import {
  MAP_CENTER_LONGITUDE,
  MAP_VIEW_HEIGHT,
  MAP_VIEW_WIDTH,
  buildLandPathData,
  projectToMapView,
} from '@/components/location-search/world-map.utils';
import { WORLD_LAND_RINGS } from '@/components/location-search/world-land.data';

describe('projectToMapView', () => {
  it('places the map centre longitude in the horizontal middle', () => {
    const { x } = projectToMapView(0, MAP_CENTER_LONGITUDE);

    expect(x).toBeCloseTo(MAP_VIEW_WIDTH / 2, 5);
  });

  it('wraps longitudes across the cut meridian', () => {
    const eastEdge = projectToMapView(0, MAP_CENTER_LONGITUDE - 179.9);
    const westEdge = projectToMapView(0, MAP_CENTER_LONGITUDE + 179.9);

    expect(eastEdge.x).toBeLessThan(1);
    expect(westEdge.x).toBeGreaterThan(MAP_VIEW_WIDTH - 1);
  });

  it('keeps northern latitudes above southern latitudes inside the crop', () => {
    const north = projectToMapView(60, MAP_CENTER_LONGITUDE);
    const south = projectToMapView(-40, MAP_CENTER_LONGITUDE);

    expect(north.y).toBeGreaterThan(0);
    expect(north.y).toBeLessThan(south.y);
    expect(south.y).toBeLessThan(MAP_VIEW_HEIGHT);
  });

  it('clamps extreme latitudes instead of returning infinity', () => {
    expect(Number.isFinite(projectToMapView(90, 0).y)).toBe(true);
    expect(Number.isFinite(projectToMapView(-90, 0).y)).toBe(true);
  });
});

describe('buildLandPathData', () => {
  it('builds closed subpaths for every ring', () => {
    const pathData = buildLandPathData();

    expect(pathData.startsWith('M')).toBe(true);
    expect(pathData).toContain('Z');
    expect((pathData.match(/Z/g) ?? []).length).toBeGreaterThanOrEqual(WORLD_LAND_RINGS.length);
  });

  it('splits rings that cross the cut meridian rather than smearing them', () => {
    const ring: [number, number][] = [
      [-170, 10],
      [170, 10],
      [170, -10],
      [-170, -10],
      [-170, 10],
    ];

    const pathData = buildLandPathData([ring], 0);

    expect((pathData.match(/M/g) ?? []).length).toBeGreaterThan(1);
  });
});
