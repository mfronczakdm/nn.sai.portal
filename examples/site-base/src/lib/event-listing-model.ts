import {
  dateKey,
  formatDateHeader,
  formatListingDateTime,
  parseSitecoreDateTime,
} from '@/lib/event-datetime';
import { extractImageAlt, extractImageSrc } from '@/lib/sitecore-image-field';

export type JsonField<T = { value?: unknown }> = { jsonValue?: T; value?: unknown };

export type EventListingChild = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: { path?: string };
  pageTitle?: JsonField;
  image?: JsonField & { value?: unknown };
  eventStart?: JsonField;
  eventEnd?: JsonField;
  eventLocation?: JsonField;
  eventType?: JsonField;
  eventTimezone?: JsonField;
};

export type EventListingDatasource = {
  listingTitle?: JsonField;
  searchPlaceholder?: JsonField;
  eventTypeLabel?: JsonField;
  moreInfoLabel?: JsonField;
  clearCalendarLabel?: JsonField;
  emptyResultsText?: JsonField;
  eventsRoot?: {
    jsonValue?: unknown;
    targetItem?: {
      children?: {
        results?: EventListingChild[];
      };
    };
  };
};

export type ResolvedEvent = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  start: Date | null;
  end: Date | null;
  dateKey: string;
  location: string;
  eventType: string;
  timezone: string;
  listingDateTime: string;
  titleField?: { value?: string };
};

export type EventFilters = {
  keyword: string;
  selectedDate: string | null;
  selectedTypes: string[];
};

export type EventDateGroup = {
  key: string;
  header: string;
  events: ResolvedEvent[];
};

function fieldString(field?: JsonField | null): string {
  const fromJson = field?.jsonValue as { value?: unknown } | undefined;
  const value = fromJson?.value ?? field?.value;
  return typeof value === 'string' ? value.trim() : '';
}

export function listingFieldString(field?: JsonField | null): string {
  return fieldString(field);
}

export function itemHref(item: EventListingChild): string {
  const path = item.url?.path?.trim();
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}

export function resolveEvent(item: EventListingChild): ResolvedEvent {
  const title =
    fieldString(item.pageTitle) || item.displayName?.trim() || item.name?.replace(/-/g, ' ') || 'Event';
  const start = parseSitecoreDateTime(fieldString(item.eventStart));
  const end = parseSitecoreDateTime(fieldString(item.eventEnd));
  const timezone = fieldString(item.eventTimezone) || 'EST';
  const imageSrc = extractImageSrc(item.image);
  const imageAlt = extractImageAlt(item.image) || title;
  return {
    id: item.id || title,
    title,
    href: itemHref(item),
    imageSrc,
    imageAlt,
    start,
    end,
    dateKey: start ? dateKey(start) : '',
    location: fieldString(item.eventLocation),
    eventType: fieldString(item.eventType),
    timezone,
    listingDateTime: start ? formatListingDateTime(start, end, timezone) : '',
    titleField: item.pageTitle?.jsonValue as { value?: string } | undefined,
  };
}

export function collectEventTypes(events: ResolvedEvent[]): string[] {
  const known = ['Seminar', 'Networking', 'Trend Talk', 'Amenity'];
  const found = new Set(events.map((event) => event.eventType).filter(Boolean));
  const extras = [...found].filter((type) => !known.includes(type)).sort((a, b) => a.localeCompare(b));
  return [...known.filter((type) => found.has(type)), ...extras];
}

export function filterEvents(events: ResolvedEvent[], filters: EventFilters): ResolvedEvent[] {
  const keyword = filters.keyword.trim().toLowerCase();
  return events.filter((event) => {
    if (filters.selectedDate && event.dateKey !== filters.selectedDate) return false;
    if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes(event.eventType)) {
      return false;
    }
    if (!keyword) return true;
    const haystack = `${event.title} ${event.location} ${event.eventType}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

export function groupEventsByDate(events: ResolvedEvent[]): EventDateGroup[] {
  const sorted = [...events].sort((a, b) => {
    const aTime = a.start?.getTime() ?? Number.POSITIVE_INFINITY;
    const bTime = b.start?.getTime() ?? Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    return a.title.localeCompare(b.title);
  });

  const groups = new Map<string, ResolvedEvent[]>();
  for (const event of sorted) {
    const key = event.dateKey || 'undated';
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  return [...groups.entries()].map(([key, grouped]) => {
    const first = grouped[0]?.start;
    return {
      key,
      header: first ? formatDateHeader(first, grouped.length) : `Upcoming | ${grouped.length} Events`,
      events: grouped,
    };
  });
}

export function defaultCalendarMonth(events: ResolvedEvent[]): { year: number; monthIndex: number } {
  const september = events.find((event) => event.start?.getFullYear() === 2026 && event.start.getMonth() === 8);
  if (september?.start) {
    return { year: 2026, monthIndex: 8 };
  }
  const first = events.find((event) => event.start)?.start;
  if (first) return { year: first.getFullYear(), monthIndex: first.getMonth() };
  return { year: 2026, monthIndex: 8 };
}

export function childrenFromDatasource(datasource?: EventListingDatasource | null): EventListingChild[] {
  return datasource?.eventsRoot?.targetItem?.children?.results ?? [];
}
