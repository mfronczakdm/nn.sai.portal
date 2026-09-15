'use client';

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { shouldBypassOptimizer } from '@/lib/sitecore-image-loader';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ComponentProps } from '@/lib/component-props';
import { MONTH_NAMES, WEEKDAYS, buildMonthGrid, dateKey } from '@/lib/event-datetime';
import {
  childrenFromDatasource,
  collectEventTypes,
  defaultCalendarMonth,
  extractEventsRootId,
  filterEvents,
  groupEventsByDate,
  hasAssignedDatasource,
  isEdgeResolvableItemRef,
  listingFieldJson,
  listingFieldString,
  paginateEvents,
  parseEventListingPageSize,
  resolveEvent,
  resolveListingDatasource,
  toEventListingItemPath,
  type EventListingChild,
  type EventListingFieldBag,
} from '@/lib/event-listing-model';

export type EventListingProps = ComponentProps & {
  fields?: EventListingFieldBag;
};

const EventListingEmpty = (): JSX.Element => <NoDataFallback componentName="EventListing" />;

export const Default = ({ fields, params, rendering }: EventListingProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier, pageSize: pageSizeParam } = (params || {}) as {
    styles?: string;
    RenderingIdentifier?: string;
    pageSize?: string;
  };
  const datasource = resolveListingDatasource(fields);
  const datasourceAssigned = hasAssignedDatasource(fields, rendering);
  const inlineChildren = useMemo(() => childrenFromDatasource(datasource), [datasource]);
  const eventsRootId = extractEventsRootId(datasource?.eventsRoot);
  const datasourceId = rendering?.dataSource?.trim() ?? '';
  const language =
    (page?.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';
  const [remoteChildren, setRemoteChildren] = useState<EventListingChild[]>([]);

  useEffect(() => {
    if (inlineChildren.length > 0) return;
    const rootRef = toEventListingItemPath(isEdgeResolvableItemRef(eventsRootId) ? eventsRootId : '');
    const dsRef = toEventListingItemPath(isEdgeResolvableItemRef(datasourceId) ? datasourceId : '');
    if (!rootRef && !dsRef) return;

    const controller = new AbortController();
    const query = new URLSearchParams({ language });
    if (rootRef) query.set('root', rootRef);
    if (dsRef) query.set('datasource', dsRef);
    if (isEditing) query.set('preview', '1');

    fetch(`/api/event-listing?${query.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          console.error('[EventListing] /api/event-listing failed', response.status);
          return { events: [] as EventListingChild[] };
        }
        return response.json() as Promise<{ events?: EventListingChild[] }>;
      })
      .then((payload: { events?: EventListingChild[] }) => {
        if (payload?.events?.length) setRemoteChildren(payload.events);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== 'AbortError') {
          console.error('[EventListing] failed to load events', error);
        }
      });

    return () => controller.abort();
  }, [inlineChildren.length, eventsRootId, datasourceId, language, isEditing]);

  const events = useMemo(() => {
    const source = inlineChildren.length > 0 ? inlineChildren : remoteChildren;
    return source.map(resolveEvent);
  }, [inlineChildren, remoteChildren]);
  const eventTypes = useMemo(() => collectEventTypes(events), [events]);
  const initialMonth = useMemo(() => defaultCalendarMonth(events), [events]);

  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [month, setMonth] = useState(initialMonth);
  const filtersKey = `${keyword}\0${selectedDate ?? ''}\0${selectedTypes.join('\0')}`;
  const [paging, setPaging] = useState({ filtersKey, page: 1 });
  const currentPage = paging.filtersKey === filtersKey ? paging.page : 1;
  const pageSize = parseEventListingPageSize(pageSizeParam);

  const filtered = useMemo(
    () => filterEvents(events, { keyword, selectedDate, selectedTypes }),
    [events, keyword, selectedDate, selectedTypes]
  );
  const paged = useMemo(
    () => paginateEvents(filtered, currentPage, pageSize),
    [filtered, currentPage, pageSize]
  );
  const groups = useMemo(() => groupEventsByDate(paged.items), [paged.items]);
  const cells = useMemo(() => buildMonthGrid(month.year, month.monthIndex), [month]);

  const goToPage = (page: number) => setPaging({ filtersKey, page });

  if (!datasource && !(isEditing && datasourceAssigned)) {
    return <EventListingEmpty />;
  }

  const listing = datasource ?? {};
  const searchPlaceholder = listingFieldString(listing.searchPlaceholder) || 'Search';
  const typeLabel = listingFieldString(listing.eventTypeLabel) || 'Event Type';
  const moreInfoLabel = listingFieldString(listing.moreInfoLabel) || 'More Info';
  const clearLabel = listingFieldString(listing.clearCalendarLabel) || 'CLEAR CALENDAR SELECTION';
  const emptyText = listingFieldString(listing.emptyResultsText) || 'No events match your filters.';
  const listingTitle = listingFieldJson(listing.listingTitle);

  const toggleType = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  const shiftMonth = (delta: number) => {
    setMonth((current) => {
      const next = new Date(current.year, current.monthIndex + delta, 1);
      return { year: next.getFullYear(), monthIndex: next.getMonth() };
    });
  };

  return (
    <section
      className={cn('aa-events-listing @container w-full bg-background px-4 py-8 md:px-8', styles)}
      id={RenderingIdentifier}
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(16rem,22%)_1fr]">
        <aside className="aa-events-filters flex flex-col gap-6">
          {(listingFieldString(listing.listingTitle) || isEditing) && (
            <Text tag="h2" field={listingTitle} className="text-foreground text-xl font-bold" />
          )}

          <div>
            <label htmlFor="aa-event-search" className="text-foreground mb-2 block text-sm font-semibold">
              Search
            </label>
            <div className="relative">
              <Search
                aria-hidden
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                id="aa-event-search"
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={searchPlaceholder}
                className="rounded-none pl-9"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-foreground text-sm font-semibold">
                {MONTH_NAMES[month.monthIndex]} {month.year}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="hover:bg-muted inline-flex size-8 items-center justify-center"
                  onClick={() => shiftMonth(-1)}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="hover:bg-muted inline-flex size-8 items-center justify-center"
                  onClick={() => shiftMonth(1)}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {WEEKDAYS.map((day) => (
                <span key={day} className="text-muted-foreground py-1 font-medium">
                  {day}
                </span>
              ))}
              {cells.map((cell) => {
                const isSelected = selectedDate === cell.key;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : cell.key)}
                    className={cn(
                      'aa-calendar-day mx-auto flex size-8 items-center justify-center text-sm',
                      !cell.inMonth && 'text-muted-foreground/40',
                      isSelected && 'aa-calendar-day-selected bg-foreground text-background rounded-full'
                    )}
                    aria-pressed={isSelected}
                    aria-label={dateKey(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="aa-clear-calendar mt-3 text-left text-xs font-semibold tracking-wide uppercase"
              >
                {clearLabel}
              </button>
            )}
          </div>

          <fieldset>
            <legend className="text-foreground mb-3 text-sm font-semibold">{typeLabel}</legend>
            <div className="flex flex-col gap-2">
              {eventTypes.length === 0 && isEditing && (
                <p className="text-muted-foreground text-sm">Event types appear from event pages.</p>
              )}
              {eventTypes.map((type) => {
                const checked = selectedTypes.includes(type);
                const id = `aa-event-type-${type.replace(/\s+/g, '-').toLowerCase()}`;
                return (
                  <label key={type} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleType(type)}
                      className="rounded-none"
                    />
                    {type}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </aside>

        <div className="aa-events-results min-w-0">
          {groups.length === 0 && (
            <p className="text-muted-foreground border-border border px-4 py-10 text-center text-sm">
              {emptyText}
            </p>
          )}
          {groups.map((group) => (
            <section key={group.key} className="mb-8">
              <h3 className="text-foreground border-border mb-4 border-b pb-2 text-lg font-bold">
                {group.header}
              </h3>
              <ul className="divide-border divide-y">
                {group.events.map((event) => (
                  <li key={event.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start">
                    <Link href={event.href} className="bg-muted block h-28 w-full shrink-0 overflow-hidden sm:h-24 sm:w-40">
                      {event.imageSrc ? (
                        <Image
                          src={event.imageSrc}
                          alt={event.imageAlt}
                          width={320}
                          height={192}
                          className="h-full w-full object-cover"
                          unoptimized={shouldBypassOptimizer(event.imageSrc)}
                        />
                      ) : (
                        <span className="bg-muted block h-full w-full" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={event.href} className="aa-event-title text-xl font-bold no-underline hover:underline">
                        {event.titleField?.value || isEditing ? (
                          <Text field={event.titleField} tag="span" />
                        ) : (
                          event.title
                        )}
                      </Link>
                      {event.listingDateTime && (
                        <p className="text-muted-foreground mt-2 flex items-start gap-2 text-sm">
                          <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
                          <span>{event.listingDateTime}</span>
                        </p>
                      )}
                      {event.location && (
                        <p className="text-muted-foreground mt-1 flex items-start gap-2 text-sm">
                          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                          <span>{event.location}</span>
                        </p>
                      )}
                      <Link
                        href={event.href}
                        className="aa-more-info mt-3 inline-flex items-center gap-1 text-sm font-semibold no-underline hover:underline"
                      >
                        {moreInfoLabel}
                        <ArrowRight aria-hidden className="size-4" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {paged.totalPages > 1 && (
            <nav
              className="aa-events-pagination mt-8 flex flex-wrap items-center justify-center gap-2"
              aria-label="Event listing pagination"
            >
              <button
                type="button"
                className="border-border hover:bg-muted inline-flex h-9 items-center gap-1 border px-3 text-sm font-semibold disabled:opacity-40"
                disabled={paged.page <= 1}
                onClick={() => goToPage(Math.max(1, paged.page - 1))}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </button>
              {Array.from({ length: paged.totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-label={`Page ${page}`}
                  aria-current={page === paged.page ? 'page' : undefined}
                  className={cn(
                    'inline-flex size-9 items-center justify-center border text-sm font-semibold',
                    page === paged.page
                      ? 'aa-events-page-current border-foreground bg-foreground text-background'
                      : 'border-border hover:bg-muted'
                  )}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="border-border hover:bg-muted inline-flex h-9 items-center gap-1 border px-3 text-sm font-semibold disabled:opacity-40"
                disabled={paged.page >= paged.totalPages}
                onClick={() => goToPage(Math.min(paged.totalPages, paged.page + 1))}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
};
