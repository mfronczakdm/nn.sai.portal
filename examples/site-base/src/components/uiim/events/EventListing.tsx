'use client';

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
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
  filterEvents,
  groupEventsByDate,
  listingFieldString,
  resolveEvent,
  type EventListingDatasource,
} from '@/lib/event-listing-model';

export type EventListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: EventListingDatasource | null;
    };
  };
};

const EventListingEmpty = (): JSX.Element => <NoDataFallback componentName="EventListing" />;

function fieldText(field?: { jsonValue?: { value?: string } }): { value?: string } | undefined {
  return field?.jsonValue as { value?: string } | undefined;
}

export const Default = ({ fields, params }: EventListingProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};
  const datasource = fields?.data?.datasource;

  const events = useMemo(
    () => childrenFromDatasource(datasource).map(resolveEvent),
    [datasource]
  );
  const eventTypes = useMemo(() => collectEventTypes(events), [events]);
  const initialMonth = useMemo(() => defaultCalendarMonth(events), [events]);

  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [month, setMonth] = useState(initialMonth);

  const filtered = useMemo(
    () => filterEvents(events, { keyword, selectedDate, selectedTypes }),
    [events, keyword, selectedDate, selectedTypes]
  );
  const groups = useMemo(() => groupEventsByDate(filtered), [filtered]);
  const cells = useMemo(() => buildMonthGrid(month.year, month.monthIndex), [month]);

  if (!datasource) {
    return <EventListingEmpty />;
  }

  const searchPlaceholder = listingFieldString(datasource.searchPlaceholder) || 'Search';
  const typeLabel = listingFieldString(datasource.eventTypeLabel) || 'Event Type';
  const moreInfoLabel = listingFieldString(datasource.moreInfoLabel) || 'More Info';
  const clearLabel = listingFieldString(datasource.clearCalendarLabel) || 'CLEAR CALENDAR SELECTION';
  const emptyText = listingFieldString(datasource.emptyResultsText) || 'No events match your filters.';
  const listingTitle = fieldText(datasource.listingTitle);

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
          {(listingFieldString(datasource.listingTitle) || isEditing) && (
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
        </div>
      </div>
    </section>
  );
};
