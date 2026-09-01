import {
  buildIcsEvent,
  dateKey,
  formatDateHeader,
  formatListingDateTime,
  parentPathFromItemPath,
  parseSitecoreDateTime,
  toIcsLocal,
} from '@/lib/event-datetime';
import {
  collectEventTypes,
  filterEvents,
  groupEventsByDate,
  resolveEvent,
  type EventListingChild,
} from '@/lib/event-listing-model';

describe('event-datetime', () => {
  it('parses Sitecore Datetime as wall-clock local time', () => {
    const date = parseSitecoreDateTime('20260915T083000');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(15);
    expect(date?.getHours()).toBe(8);
    expect(date?.getMinutes()).toBe(30);
  });

  it('formats listing datetime and date headers', () => {
    const start = parseSitecoreDateTime('20260915T083000')!;
    const end = parseSitecoreDateTime('20260915T093000')!;
    expect(formatListingDateTime(start, end, 'EST')).toBe(
      'Tuesday, September 15, 2026 | 08:30 AM - 09:30 AM EST'
    );
    expect(formatDateHeader(start, 1)).toBe('Tuesday, September 15, 2026 | 1 Event');
    expect(toIcsLocal(start)).toBe('20260915T083000');
  });

  it('builds an ICS file and parent listing path', () => {
    const start = parseSitecoreDateTime('20260915T083000')!;
    const ics = buildIcsEvent({
      title: 'Outdoor Living Trends Talk',
      start,
      location: 'Building 1, Floor 8, Oasis Meeting Space',
    });
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Outdoor Living Trends Talk');
    expect(parentPathFromItemPath('/Visit/Events/Outdoor Living Trends Talk')).toBe('/Visit/Events');
    expect(dateKey(start)).toBe('2026-09-15');
  });
});

function child(overrides: Partial<EventListingChild> & { name: string }): EventListingChild {
  return {
    id: overrides.id || overrides.name,
    name: overrides.name,
    displayName: overrides.displayName || overrides.name,
    url: overrides.url || { path: `/Visit/Events/${overrides.name}` },
    pageTitle: overrides.pageTitle || { jsonValue: { value: overrides.name } },
    eventStart: overrides.eventStart,
    eventEnd: overrides.eventEnd,
    eventLocation: overrides.eventLocation,
    eventType: overrides.eventType,
    eventTimezone: overrides.eventTimezone || { jsonValue: { value: 'EST' } },
    image: overrides.image,
  };
}

describe('event-listing-model', () => {
  const events = [
    resolveEvent(
      child({
        name: 'Outdoor Living Trends Talk',
        eventStart: { jsonValue: { value: '20260915T083000' } },
        eventEnd: { jsonValue: { value: '20260915T093000' } },
        eventLocation: { jsonValue: { value: 'Building 1, Floor 8, Oasis Meeting Space' } },
        eventType: { jsonValue: { value: 'Trend Talk' } },
      })
    ),
    resolveEvent(
      child({
        name: 'Closing Toast',
        eventStart: { jsonValue: { value: '20260918T090000' } },
        eventType: { jsonValue: { value: 'Networking' } },
      })
    ),
  ];

  it('groups events by start date with counts', () => {
    const groups = groupEventsByDate(events);
    expect(groups).toHaveLength(2);
    expect(groups[0].header).toContain('Tuesday, September 15, 2026 | 1 Event');
    expect(groups[1].header).toContain('Friday, September 18, 2026 | 1 Event');
  });

  it('filters by keyword, date, and event type', () => {
    expect(filterEvents(events, { keyword: 'oasis', selectedDate: null, selectedTypes: [] })).toHaveLength(
      1
    );
    expect(
      filterEvents(events, { keyword: '', selectedDate: '2026-09-18', selectedTypes: [] })
    ).toHaveLength(1);
    expect(
      filterEvents(events, { keyword: '', selectedDate: null, selectedTypes: ['Networking'] })
    ).toEqual([expect.objectContaining({ title: 'Closing Toast' })]);
  });

  it('collects taxonomy types from authored event pages', () => {
    expect(collectEventTypes(events)).toEqual(['Networking', 'Trend Talk']);
  });
});
