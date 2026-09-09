import {
  fetchPhysicianListingChildren,
  fetchPhysicianListingPayload,
  hydratePhysicianLocations,
  toLocationsFolderPath,
  toPhysicianListingItemPath,
} from '@/lib/physician-listing-from-edge';

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

const CAMILLE = {
  id: 'phys-1',
  name: 'Camille Landry MD',
  url: { path: '/Data/Physicians/Camille-Landry-MD' },
  physicianFullName: { value: 'Camille Landry' },
  credentials: { value: 'MD, FACC' },
  specialty: { value: 'Cardiology' },
  physicianPhone: { value: '504-503-4100' },
  physicianDetailPage: { value: '{8118B0CB-720B-4707-9C67-DCE15ECF16FB}' },
  servingLocations: {
    value: '{EFEAC293-2BF4-4516-873D-4EAC1F998474}',
    targetItems: [
      {
        id: 'loc-1',
        name: 'East Jefferson General Hospital',
        displayName: 'East Jefferson General Hospital',
      },
    ],
  },
};

describe('toPhysicianListingItemPath', () => {
  it('wraps an unbraced GUID for Edge item(path:)', () => {
    expect(toPhysicianListingItemPath('13c422fb-8991-4468-b996-be73a904c23e')).toBe(
      '{13C422FB-8991-4468-B996-BE73A904C23E}'
    );
  });

  it('keeps Sitecore content paths', () => {
    expect(toPhysicianListingItemPath('/sitecore/content/lcmc/lcmc/Data/Physicians')).toBe(
      '/sitecore/content/lcmc/lcmc/Data/Physicians'
    );
  });
});

describe('fetchPhysicianListingChildren', () => {
  beforeEach(() => {
    getData.mockReset();
    previewGetData.mockReset();
  });

  it('maps paged physician children and ServingLocations targetItems', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [CAMILLE],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const physicians = await fetchPhysicianListingChildren({
      path: '{13C422FB-8991-4468-B996-BE73A904C23E}',
      language: 'en',
    });

    expect(physicians).toHaveLength(1);
    expect(physicians[0].physicianFullName?.jsonValue).toEqual({ value: 'Camille Landry' });
    expect(physicians[0].servingLocations?.targetItems?.[0].name).toBe(
      'East Jefferson General Hospital'
    );
    expect(getData).toHaveBeenCalledTimes(1);
    expect(getData.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        path: '{13C422FB-8991-4468-B996-BE73A904C23E}',
        language: 'en',
      })
    );
  });

  it('pages past the first 10 children', async () => {
    getData
      .mockResolvedValueOnce({
        item: {
          children: {
            results: [CAMILLE],
            pageInfo: { hasNext: true, endCursor: 'cursor-2' },
          },
        },
      })
      .mockResolvedValueOnce({
        item: {
          children: {
            results: [{ ...CAMILLE, id: 'phys-2', name: 'Anita Chauvin MD' }],
            pageInfo: { hasNext: false, endCursor: null },
          },
        },
      });

    const physicians = await fetchPhysicianListingChildren({
      path: '13c422fb-8991-4468-b996-be73a904c23e',
      language: 'en',
    });

    expect(physicians).toHaveLength(2);
    expect(getData).toHaveBeenCalledTimes(2);
    expect(getData.mock.calls[1][1].after).toBe('cursor-2');
  });

  it('falls back to live Edge when preview returns no children', async () => {
    previewGetData.mockResolvedValueOnce({
      item: { children: { results: [], pageInfo: { hasNext: false } } },
    });
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [CAMILLE],
          pageInfo: { hasNext: false, endCursor: null },
        },
      },
    });

    const physicians = await fetchPhysicianListingChildren({
      path: '{13C422FB-8991-4468-B996-BE73A904C23E}',
      language: 'en',
      edgeMode: 'preview',
    });

    expect(physicians).toHaveLength(1);
    expect(previewGetData).toHaveBeenCalled();
    expect(getData).toHaveBeenCalled();
  });
});

describe('toLocationsFolderPath', () => {
  it('derives Data/Locations from a Physicians content path', () => {
    expect(toLocationsFolderPath('/sitecore/content/lcmc/lcmc/Data/Physicians')).toBe(
      '/sitecore/content/lcmc/lcmc/Data/Locations'
    );
  });

  it('maps the Physicians folder GUID to the LCMC Locations folder', () => {
    expect(toLocationsFolderPath('{13C422FB-8991-4468-B996-BE73A904C23E}')).toBe(
      '/sitecore/content/lcmc/lcmc/Data/Locations'
    );
  });
});

describe('hydratePhysicianLocations', () => {
  it('resolves ServingLocations GUIDs to catalog display names', () => {
    const physicians = hydratePhysicianLocations(
      [
        {
          id: 'phys-ent',
          name: 'Gabrielle Moreau MD',
          servingLocations: {
            jsonValue: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}',
            targetItems: [{ id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}', name: '', displayName: '' }],
          },
        },
      ],
      [
        {
          id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}',
          name: 'West Jefferson Medical Center',
          displayName: 'West Jefferson Medical Center',
          locationTitle: { jsonValue: { value: 'West Jefferson Medical Center' } },
        },
      ]
    );

    expect(physicians[0].servingLocations?.targetItems?.[0].name).toBe(
      'West Jefferson Medical Center'
    );
    expect(physicians[0].servingLocations?.targetItems?.[0].locationTitle?.jsonValue).toEqual({
      value: 'West Jefferson Medical Center',
    });
  });
});

describe('fetchPhysicianListingPayload', () => {
  beforeEach(() => {
    getData.mockReset();
    previewGetData.mockReset();
  });

  it('returns the Data/Locations catalog and hydrates GUID-only ServingLocations', async () => {
    getData.mockImplementation((query: string) => {
      if (String(query).includes('PhysicianListingLocations')) {
        return Promise.resolve({
          item: {
            children: {
              results: [
                {
                  id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}',
                  name: 'West Jefferson Medical Center',
                  displayName: 'West Jefferson Medical Center',
                  locationTitle: { value: 'West Jefferson Medical Center' },
                },
                {
                  id: '{063FFD1D-6681-4DFC-8A7A-504EA903090F}',
                  name: 'Touro',
                  displayName: 'Touro',
                  locationTitle: { value: 'Touro' },
                },
              ],
            },
          },
        });
      }
      return Promise.resolve({
        item: {
          children: {
            results: [
              {
                ...CAMILLE,
                servingLocations: { value: '{EFEAC293-2BF4-4516-873D-4EAC1F998474}' },
              },
            ],
            pageInfo: { hasNext: false, endCursor: null },
          },
        },
      });
    });

    const payload = await fetchPhysicianListingPayload({
      path: '{13C422FB-8991-4468-B996-BE73A904C23E}',
      language: 'en',
    });

    expect(payload.locations.map((location) => location.name)).toEqual([
      'West Jefferson Medical Center',
      'Touro',
    ]);
    expect(payload.physicians).toHaveLength(1);
  });
});
