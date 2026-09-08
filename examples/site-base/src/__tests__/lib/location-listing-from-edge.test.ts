import {
  fetchLocationListingChildren,
  toLocationListingItemPath,
} from '@/lib/location-listing-from-edge';
import {
  LCMC_DATA_LOCATIONS_ID,
  LCMC_OUR_LOCATIONS_PAGE_ID,
} from '@/lib/location-listing.utils';

const getData = jest.fn();
const previewGetData = jest.fn();

jest.mock('@/lib/sitecore-client', () => ({
  __esModule: true,
  default: {
    getData: (...args: unknown[]) => getData(...args),
  },
}));

jest.mock('@sitecore-content-sdk/nextjs/client', () => ({
  SitecoreClient: jest.fn().mockImplementation(() => ({
    getData: (...args: unknown[]) => previewGetData(...args),
  })),
}));

const EAST_JEFFERSON = {
  id: 'loc-1',
  name: 'East Jefferson General Hospital',
  url: { path: '/Data/Locations/East-Jefferson-General-Hospital' },
  locationTitle: { value: 'East Jefferson General Hospital' },
  locationShortName: { value: 'East Jefferson' },
  locationType: { value: 'Hospital' },
  streetAddress: { value: '4200 Houma Blvd.' },
  city: { value: 'Metairie' },
  state: { value: 'LA' },
  postalCode: { value: '70006' },
  phoneNumber: { value: '504-503-4000' },
  latitude: { value: '29.9967' },
  longitude: { value: '-90.1526' },
  landingPage: {
    value: '{8EED2D44-9041-483E-9DE2-6DEE4E92B0B0}',
    targetItem: {
      id: 'page-1',
      name: 'East Jefferson General Hospital',
      url: { path: '/Our-Locations/East-Jefferson-General-Hospital' },
    },
  },
};

describe('toLocationListingItemPath', () => {
  it('wraps an unbraced GUID for Edge item(path:)', () => {
    expect(toLocationListingItemPath('76041887-6e16-4844-ad13-366bc2e32265')).toBe(
      '{76041887-6E16-4844-AD13-366BC2E32265}'
    );
  });

  it('keeps Sitecore content paths', () => {
    expect(toLocationListingItemPath('/sitecore/content/lcmc/lcmc/Data/Locations')).toBe(
      '/sitecore/content/lcmc/lcmc/Data/Locations'
    );
  });
});

describe('fetchLocationListingChildren', () => {
  beforeEach(() => {
    getData.mockReset();
    previewGetData.mockReset();
  });

  it('maps paged location children and LandingPage targetItems', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [EAST_JEFFERSON],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const locations = await fetchLocationListingChildren({
      path: '{76041887-6E16-4844-AD13-366BC2E32265}',
      language: 'en',
    });

    expect(locations).toHaveLength(1);
    expect(locations[0].locationTitle?.jsonValue).toEqual({
      value: 'East Jefferson General Hospital',
    });
    expect(locations[0].latitude?.jsonValue).toEqual({ value: '29.9967' });
    expect(locations[0].landingPage?.targetItem?.url?.path).toBe(
      '/Our-Locations/East-Jefferson-General-Hospital'
    );
    expect(getData).toHaveBeenCalledTimes(1);
  });

  it('retries without LookupField when the full query fails', async () => {
    getData.mockRejectedValueOnce(new Error('too complex'));
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [{ ...EAST_JEFFERSON, landingPage: { value: '{8EED2D44-9041-483E-9DE2-6DEE4E92B0B0}' } }],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const locations = await fetchLocationListingChildren({
      path: '{76041887-6E16-4844-AD13-366BC2E32265}',
      language: 'en',
    });

    expect(locations).toHaveLength(1);
    expect(getData).toHaveBeenCalledTimes(2);
  });

  it('returns mapped locations when datasource is the Data/Locations folder', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [EAST_JEFFERSON],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const locations = await fetchLocationListingChildren({
      path: LCMC_DATA_LOCATIONS_ID,
      language: 'en',
    });

    expect(locations).toHaveLength(1);
    expect(locations[0].locationTitle?.jsonValue).toEqual({
      value: 'East Jefferson General Hospital',
    });
    expect(locations[0].latitude?.jsonValue).toEqual({ value: '29.9967' });
    expect(getData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ path: LCMC_DATA_LOCATIONS_ID, language: 'en' })
    );
  });

  it('returns the same mapped locations when datasource is the Our Locations page', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [EAST_JEFFERSON],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const locations = await fetchLocationListingChildren({
      path: LCMC_OUR_LOCATIONS_PAGE_ID,
      language: 'en',
    });

    expect(locations).toHaveLength(1);
    expect(locations[0].locationTitle?.jsonValue).toEqual({
      value: 'East Jefferson General Hospital',
    });
    expect(locations[0].latitude?.jsonValue).toEqual({ value: '29.9967' });
    expect(locations[0].landingPage?.targetItem?.url?.path).toBe(
      '/Our-Locations/East-Jefferson-General-Hospital'
    );
    expect(getData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ path: LCMC_DATA_LOCATIONS_ID, language: 'en' })
    );
  });

  it('ignores sitemap page children and falls back to Data/Locations', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [
            { id: 'page-ejgh', name: 'East Jefferson General Hospital' },
            { id: 'page-lakeside', name: 'Lakeside Hospital' },
          ],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [EAST_JEFFERSON],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const locations = await fetchLocationListingChildren({
      path: '{8EED2D44-9041-483E-9DE2-6DEE4E92B0B0}',
      language: 'en',
    });

    expect(locations).toHaveLength(1);
    expect(locations[0].latitude?.jsonValue).toEqual({ value: '29.9967' });
    expect(getData).toHaveBeenCalledTimes(2);
    expect(getData).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ path: LCMC_DATA_LOCATIONS_ID })
    );
  });
});
