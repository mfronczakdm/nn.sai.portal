import { fetchEventListingChildren } from '@/lib/event-listing-from-edge';

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

const TALK = {
  id: 'talk',
  name: 'Outdoor Living Trends Talk',
  displayName: 'Outdoor Living Trends Talk',
  url: { path: '/Visit/Events/Outdoor-Living-Trends-Talk' },
  pageTitle: { value: 'Outdoor Living Trends Talk' },
  eventStart: { value: '20260915T083000' },
  eventEnd: { value: '20260915T093000' },
  eventLocation: { value: 'Building 1, Floor 8, Oasis Meeting Space' },
  eventType: { value: 'Trend Talk' },
  eventTimezone: { value: 'EST' },
};

describe('fetchEventListingChildren', () => {
  beforeEach(() => {
    getData.mockReset();
    previewGetData.mockReset();
  });

  it('maps Event Page children and skips folders without EventStart', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [{ id: 'data', name: 'Data', eventStart: { value: '' } }, TALK],
        },
      },
    });

    const events = await fetchEventListingChildren({
      rootPath: '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      language: 'en',
    });

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('talk');
    expect(events[0].eventStart?.jsonValue).toEqual({ value: '20260915T083000' });
    expect(getData).toHaveBeenCalledTimes(1);
    expect(getData.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        path: '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
        language: 'en',
        first: 50,
      })
    );
  });

  it('wraps an unbraced EventsRoot GUID for Edge item(path:)', async () => {
    getData.mockResolvedValueOnce({
      item: { children: { results: [TALK] } },
    });

    await fetchEventListingChildren({
      rootPath: '47cea21c-aec1-4775-93bc-7f5d5b92dfaf',
      language: 'en',
    });

    expect(getData.mock.calls[0][1].path).toBe('{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}');
  });

  it('resolves EventsRoot from a listing datasource when rootPath is empty', async () => {
    getData
      .mockResolvedValueOnce({
        item: { eventsRoot: { value: '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}' } },
      })
      .mockResolvedValueOnce({
        item: {
          children: {
            results: [
              {
                id: 'talk',
                name: 'Outdoor Living Trends Talk',
                eventStart: { value: '20260915T083000' },
              },
            ],
          },
        },
      });

    const events = await fetchEventListingChildren({
      datasourcePath: '{684FA81B-14A4-4383-B115-2A766CA44AFB}',
      language: 'en',
    });

    expect(events).toHaveLength(1);
    expect(getData).toHaveBeenCalledTimes(2);
    expect(getData.mock.calls[0][1].path).toBe('{684FA81B-14A4-4383-B115-2A766CA44AFB}');
    expect(getData.mock.calls[1][1].path).toBe('{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}');
  });

  it('falls back to Event Page search when children are empty', async () => {
    getData
      .mockResolvedValueOnce({ item: { children: { results: [] } } })
      .mockResolvedValueOnce({ search: { results: [TALK] } });

    const events = await fetchEventListingChildren({
      rootPath: '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      language: 'en',
    });

    expect(events).toHaveLength(1);
    expect(getData).toHaveBeenCalledTimes(2);
    expect(getData.mock.calls[1][1]).toEqual({
      rootId: '47cea21c-aec1-4775-93bc-7f5d5b92dfaf',
      templateId: '6ccf3409-0a26-4069-92ec-2099dae63088',
      first: 50,
    });
  });

  it('returns [] when Edge has no children and no search hits', async () => {
    getData
      .mockResolvedValueOnce({ item: { children: { results: [] } } })
      .mockResolvedValueOnce({ search: { results: [] } });

    await expect(
      fetchEventListingChildren({
        rootPath: '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
        language: 'en',
      })
    ).resolves.toEqual([]);
  });

  it('returns [] for local: datasource paths', async () => {
    await expect(
      fetchEventListingChildren({ datasourcePath: 'local:/Data/EventListing', language: 'en' })
    ).resolves.toEqual([]);
    expect(getData).not.toHaveBeenCalled();
  });

  it('falls back to live Edge when preview children and search are empty', async () => {
    previewGetData
      .mockResolvedValueOnce({ item: { children: { results: [] } } })
      .mockResolvedValueOnce({ search: { results: [] } });
    getData.mockResolvedValueOnce({ item: { children: { results: [TALK] } } });

    const events = await fetchEventListingChildren({
      rootPath: '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      language: 'en',
      edgeMode: 'preview',
    });

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('talk');
    expect(previewGetData).toHaveBeenCalled();
    expect(getData).toHaveBeenCalled();
  });
});
