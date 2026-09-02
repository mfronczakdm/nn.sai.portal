import { fetchEventListingChildren } from '@/lib/event-listing-from-edge';

const getData = jest.fn();

jest.mock('@/lib/sitecore-client', () => ({
  __esModule: true,
  default: {
    getData: (...args: unknown[]) => getData(...args),
  },
}));

describe('fetchEventListingChildren', () => {
  beforeEach(() => {
    getData.mockReset();
  });

  it('maps Event Page children and skips folders without EventStart', async () => {
    getData.mockResolvedValueOnce({
      item: {
        children: {
          results: [
            { id: 'data', name: 'Data', eventStart: { value: '' } },
            {
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
            },
          ],
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
  });

  it('returns [] for local: datasource paths', async () => {
    await expect(
      fetchEventListingChildren({ datasourcePath: 'local:/Data/EventListing', language: 'en' })
    ).resolves.toEqual([]);
    expect(getData).not.toHaveBeenCalled();
  });
});
