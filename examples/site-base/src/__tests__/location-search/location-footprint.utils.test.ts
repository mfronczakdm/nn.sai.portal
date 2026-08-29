import {
  createFootprintPinIcon,
  FOOTPRINT_LEGEND_ITEMS,
  FOOTPRINT_PIN_COLORS,
  mapFootprintItemToPoint,
  mapFootprintItemsToPoints,
  parseGeoCoordinates,
  resolveFootprintPinType,
} from '../../components/location-search/location-footprint.utils';

describe('location-footprint.utils', () => {
  it('parses GEO coordinates', () => {
    expect(parseGeoCoordinates('33.3483,-111.9360')).toEqual({
      latitude: 33.3483,
      longitude: -111.936,
    });
  });

  it('maps footprint pin types from Sitecore Type values', () => {
    expect(resolveFootprintPinType('Corporate Headquarters')).toBe('hq');
    expect(resolveFootprintPinType('Factories')).toBe('factory');
    expect(resolveFootprintPinType('Customer Support Centers')).toBe('support');
  });

  it('maps footprint items to map points', () => {
    const points = mapFootprintItemsToPoints([
      {
        id: 'hq-1',
        name: { jsonValue: { value: 'Tempe HQ' } },
        locationType: { jsonValue: { value: 'Corporate Headquarters' } },
        GEO: { jsonValue: { value: '33.3483,-111.9360' } },
      },
      {
        id: 'factory-1',
        name: { jsonValue: { value: 'K3 Bupyeong' } },
        locationType: { jsonValue: { value: 'Factories' } },
        GEO: { jsonValue: { value: '37.5088,126.7260' } },
      },
    ]);

    expect(points).toHaveLength(2);
    expect(points[0]?.pinType).toBe('hq');
    expect(points[1]?.pinType).toBe('factory');
  });

  it('skips items without valid GEO', () => {
    const point = mapFootprintItemToPoint({
      id: 'invalid',
      name: { jsonValue: { value: 'Missing GEO' } },
      locationType: { jsonValue: { value: 'Factories' } },
      GEO: { jsonValue: { value: '' } },
    });

    expect(point).toBeNull();
  });

  it('creates pin icon data URLs for each type', () => {
    expect(createFootprintPinIcon('hq')).toContain('data:image/svg+xml');
    expect(createFootprintPinIcon('factory')).toContain('%232D8B8B');
    expect(createFootprintPinIcon('support')).toContain('%237B3F6B');
  });

  it('defines legend labels for all pin types', () => {
    expect(FOOTPRINT_LEGEND_ITEMS.map((item) => item.label)).toEqual([
      'Corporate Headquarters',
      'Factories',
      'Customer Support Centers',
    ]);
  });
});
