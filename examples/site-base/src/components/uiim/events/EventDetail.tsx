'use client';

import type { JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
  type Field,
  type ImageField,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { ChevronLeft, Clock, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import { shouldBypassOptimizer } from '@/lib/sitecore-image-loader';
import { extractImageAlt, extractImageSrc } from '@/lib/sitecore-image-field';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ComponentProps } from '@/lib/component-props';
import {
  buildIcsEvent,
  downloadIcsFile,
  formatLongDate,
  formatTimeRange,
  parentPathFromItemPath,
  parseSitecoreDateTime,
} from '@/lib/event-datetime';

export type EventDetailRouteFields = {
  pageTitle?: Field<string>;
  image?: ImageField;
  Detail?: RichTextField;
  EventStart?: Field<string>;
  EventEnd?: Field<string>;
  EventLocation?: Field<string>;
  EventType?: Field<string>;
  EventTimezone?: Field<string>;
  BackLinkText?: Field<string>;
  AddToCalendarLabel?: Field<string>;
  DetailsHeading?: Field<string>;
};

export type EventDetailProps = ComponentProps;

function textValue(field?: Field<string> | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function richHasContent(field?: RichTextField | null): boolean {
  if (!field?.value) return false;
  return field.value.replace(/<[^>]*>/g, '').trim().length > 0;
}

const EventDetailEmpty = (): JSX.Element => <NoDataFallback componentName="EventDetail" />;

export const Default = ({ params, page: pageProp }: EventDetailProps): JSX.Element => {
  const { page: sitecorePage } = useSitecore();
  const page = pageProp?.layout?.sitecore?.route ? pageProp : sitecorePage || pageProp;
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};
  const route = page?.layout?.sitecore?.route;
  const fields = (route?.fields ?? {}) as EventDetailRouteFields;

  const title = textValue(fields.pageTitle) || route?.displayName || route?.name || '';
  const imageSrc = extractImageSrc(fields.image);
  const imageAlt = extractImageAlt(fields.image) || title;
  const start = parseSitecoreDateTime(textValue(fields.EventStart));
  const end = parseSitecoreDateTime(textValue(fields.EventEnd));
  const timezone = textValue(fields.EventTimezone) || 'EST';
  const location = textValue(fields.EventLocation);
  const backLabel = textValue(fields.BackLinkText) || 'All Events';
  const calendarLabel = textValue(fields.AddToCalendarLabel) || 'Add to Calendar';
  const detailsHeading = textValue(fields.DetailsHeading) || 'Details';
  const itemPath =
    (route as { itemPath?: string } | undefined)?.itemPath ||
    (page?.layout?.sitecore?.context as { itemPath?: string } | undefined)?.itemPath;
  const listingHref = parentPathFromItemPath(itemPath);

  const hasContent = Boolean(title || imageSrc || start || location || richHasContent(fields.Detail));
  if (!hasContent && !isEditing) {
    return <EventDetailEmpty />;
  }

  const handleAddToCalendar = () => {
    if (!start) return;
    const ics = buildIcsEvent({
      title: title || 'Event',
      start,
      end,
      location,
      description: fields.Detail?.value?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    downloadIcsFile(title || 'event', ics);
  };

  return (
    <article
      className={cn('aa-event-detail @container w-full bg-background px-4 py-8 md:px-8', styles)}
      id={RenderingIdentifier}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href={listingHref}
          className="aa-event-back mb-6 inline-flex items-center gap-1 text-sm font-semibold no-underline hover:underline"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {(textValue(fields.BackLinkText) || isEditing) ? (
            <Text field={fields.BackLinkText} tag="span" />
          ) : (
            backLabel
          )}
        </Link>

        {(title || isEditing) && (
          <Text
            field={fields.pageTitle}
            tag="h1"
            className="text-foreground mb-8 text-4xl font-bold tracking-tight md:text-5xl"
          />
        )}

        <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
          <div className="aa-event-hero-image overflow-hidden">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={900}
                height={620}
                className="h-full w-full object-cover"
                unoptimized={shouldBypassOptimizer(imageSrc)}
                priority
              />
            ) : (
              (fields.image || isEditing) && (
                <ContentSdkImage field={fields.image} className="h-full w-full object-cover" />
              )
            )}
          </div>

          <div className="aa-event-info-box bg-muted flex flex-col justify-center gap-6 p-6 md:p-8">
            {start && (
              <div className="flex items-start gap-3">
                <Clock aria-hidden className="mt-1 size-5 shrink-0" />
                <div>
                  <p className="text-foreground font-medium">{formatLongDate(start)}</p>
                  <p className="text-foreground mt-1">{formatTimeRange(start, end, timezone)}</p>
                  {(calendarLabel || isEditing) && (
                    <button
                      type="button"
                      onClick={handleAddToCalendar}
                      className="aa-add-to-calendar mt-3 text-left text-sm font-semibold underline-offset-2 hover:underline"
                    >
                      {isEditing ? <Text field={fields.AddToCalendarLabel} tag="span" /> : calendarLabel}
                    </button>
                  )}
                </div>
              </div>
            )}
            {(location || isEditing) && (
              <div className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-1 size-5 shrink-0" />
                <Text field={fields.EventLocation} tag="p" className="text-foreground" />
              </div>
            )}
          </div>
        </div>

        {(richHasContent(fields.Detail) || isEditing) && (
          <section className="mt-12 max-w-4xl">
            {textValue(fields.DetailsHeading) || isEditing ? (
              <Text
                field={fields.DetailsHeading}
                tag="h2"
                className="text-foreground mb-4 text-2xl font-bold"
              />
            ) : (
              <h2 className="text-foreground mb-4 text-2xl font-bold">{detailsHeading}</h2>
            )}
            <div className="prose prose-neutral text-foreground max-w-none text-base leading-relaxed">
              <ContentSdkRichText field={fields.Detail} />
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
