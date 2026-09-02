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

export type EventListingEventsRoot = {
  jsonValue?: unknown;
  value?: unknown;
  targetItem?: {
    id?: string;
    children?: {
      results?: EventListingChild[];
    };
  };
};

export type EventListingDatasource = {
  listingTitle?: JsonField;
  searchPlaceholder?: JsonField;
  eventTypeLabel?: JsonField;
  moreInfoLabel?: JsonField;
  clearCalendarLabel?: JsonField;
  emptyResultsText?: JsonField;
  eventsRoot?: EventListingEventsRoot;
};

/** Layout GraphQL shape, or flat JSS fields when ComponentQuery is empty/failed in Pages. */
export type EventListingFieldBag = {
  data?: {
    datasource?: EventListingDatasource | null;
  };
  ListingTitle?: JsonField;
  listingTitle?: JsonField;
  SearchPlaceholder?: JsonField;
  searchPlaceholder?: JsonField;
  EventTypeLabel?: JsonField;
  eventTypeLabel?: JsonField;
  MoreInfoLabel?: JsonField;
  moreInfoLabel?: JsonField;
  ClearCalendarLabel?: JsonField;
  clearCalendarLabel?: JsonField;
  EmptyResultsText?: JsonField;
  emptyResultsText?: JsonField;
  EventsRoot?: EventListingEventsRoot | JsonField;
  eventsRoot?: EventListingEventsRoot | JsonField;
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

function jsonRawValue(field?: JsonField | null): unknown {
  const fromJson = field?.jsonValue as { value?: unknown } | undefined;
  return fromJson?.value ?? field?.value;
}

function fieldString(field?: JsonField | null): string {
  const value = jsonRawValue(field);
  return typeof value === 'string' ? value.trim() : '';
}

export function listingFieldString(field?: JsonField | null): string {
  return fieldString(field);
}

/** Sitecore `<Text field>` value from GraphQL jsonValue (unknown → string). Preserves editable chrome. */
export function listingFieldJson(field?: JsonField | null): { value?: string } | undefined {
  if (!field) return undefined;
  const source =
    field.jsonValue && typeof field.jsonValue === 'object'
      ? (field.jsonValue as Record<string, unknown>)
      : field.value !== undefined
        ? (field as Record<string, unknown>)
        : null;
  if (!source) return undefined;
  const raw = source.value;
  return { ...source, value: typeof raw === 'string' ? raw : undefined } as { value?: string };
}

function asJsonField(raw: unknown): JsonField | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  return raw as JsonField;
}

function readId(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return '';
  const record = value as { id?: string; href?: string; url?: string; path?: string };
  return (record.id || record.path || record.href || record.url || '').trim();
}

/** Droptree EventsRoot → GUID or Sitecore path for Edge `item(path:)`. */
export function extractEventsRootId(eventsRoot?: unknown): string {
  if (typeof eventsRoot === 'string') return eventsRoot.trim();
  if (!eventsRoot || typeof eventsRoot !== 'object') return '';
  const root = eventsRoot as EventListingEventsRoot & {
    jsonValue?: { value?: unknown; id?: string; href?: string; url?: string; path?: string };
  };
  const fromTarget = root.targetItem?.id?.trim();
  if (fromTarget) return fromTarget;
  const fromJsonValue = readId(root.jsonValue?.value);
  if (fromJsonValue) return fromJsonValue;
  const fromJsonRoot = readId(root.jsonValue);
  if (fromJsonRoot) return fromJsonRoot;
  return readId(root.value);
}

export function resolveListingDatasource(
  fields?: EventListingFieldBag | null
): EventListingDatasource | null {
  const graph = fields?.data?.datasource;
  if (graph) return graph;
  if (!fields) return null;

  const listingTitle = asJsonField(fields.listingTitle || fields.ListingTitle);
  const searchPlaceholder = asJsonField(fields.searchPlaceholder || fields.SearchPlaceholder);
  const eventTypeLabel = asJsonField(fields.eventTypeLabel || fields.EventTypeLabel);
  const moreInfoLabel = asJsonField(fields.moreInfoLabel || fields.MoreInfoLabel);
  const clearCalendarLabel = asJsonField(fields.clearCalendarLabel || fields.ClearCalendarLabel);
  const emptyResultsText = asJsonField(fields.emptyResultsText || fields.EmptyResultsText);
  const eventsRoot = (fields.eventsRoot || fields.EventsRoot) as EventListingEventsRoot | undefined;

  if (
    !listingTitle &&
    !searchPlaceholder &&
    !eventTypeLabel &&
    !moreInfoLabel &&
    !clearCalendarLabel &&
    !emptyResultsText &&
    !eventsRoot
  ) {
    return null;
  }

  return {
    listingTitle,
    searchPlaceholder,
    eventTypeLabel,
    moreInfoLabel,
    clearCalendarLabel,
    emptyResultsText,
    eventsRoot,
  };
}

export function hasAssignedDatasource(
  fields?: EventListingFieldBag | null,
  rendering?: { dataSource?: string } | null
): boolean {
  if (resolveListingDatasource(fields)) return true;
  return Boolean(rendering?.dataSource?.trim());
}

/** GUID or /sitecore/content path — not `local:/Data/...` relative datasource refs. */
export function isEdgeResolvableItemRef(value?: string | null): boolean {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase().startsWith('local:')) return false;
  if (trimmed.startsWith('/sitecore/')) return true;
  const guid = trimmed.replace(/[{}]/g, '');
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid);
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
    titleField: listingFieldJson(item.pageTitle),
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
