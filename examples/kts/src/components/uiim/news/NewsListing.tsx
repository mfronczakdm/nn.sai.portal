'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Field, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

type JsonField<T> = { jsonValue?: T };

type NewsListingTarget = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: { path?: string };
  pageTitle?: JsonField<Field<string>>;
  pageSubtitle?: JsonField<Field<string>>;
  pageSummary?: JsonField<Field<string>>;
  detail?: JsonField<Field<string>>;
  parent?: { name?: string };
};

type NewsListingDatasource = {
  eyebrow?: JsonField<Field<string>>;
  title?: JsonField<Field<string>>;
  items?: {
    targetItems?: NewsListingTarget[];
  };
};

export type NewsListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: NewsListingDatasource | null;
    };
  };
  isPageEditing?: boolean;
};

const PARENT_CONTENT_TYPE: Record<string, string> = {
  'Press Releases': 'Press Release',
  Coverage: 'Press Mention',
  Insights: 'Article',
  Alerts: 'Alert',
  Events: 'Event',
  'Case Studies': 'Case Study',
};

const VISIBLE_DESKTOP = 4;

function fieldString(field?: JsonField<Field<string>> | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function humanizeName(name?: string): string {
  if (!name?.trim()) return 'Untitled';
  return name
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contentTypeFromParent(parentName?: string): string {
  if (!parentName) return 'News';
  return PARENT_CONTENT_TYPE[parentName] || parentName;
}

function itemHref(item: NewsListingTarget): string {
  const path = item.url?.path?.trim();
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromDetail(detailHtml: string): string {
  const h2 = detailHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
  return h2 ? stripHtml(h2) : '';
}

const MONTH_DATE_RE =
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i;

function dateFromText(...chunks: string[]): string {
  for (const chunk of chunks) {
    const match = chunk.match(MONTH_DATE_RE);
    if (match) return match[0];
  }
  return '';
}

function itemTitle(item: NewsListingTarget): string {
  const detail = fieldString(item.detail);
  return (
    fieldString(item.pageTitle) ||
    titleFromDetail(detail) ||
    item.displayName?.trim() ||
    humanizeName(item.name)
  );
}

function itemDate(item: NewsListingTarget): string {
  const detail = fieldString(item.detail);
  const summary = fieldString(item.pageSummary);
  return fieldString(item.pageSubtitle) || dateFromText(summary, detail);
}

type ResolvedNewsItem = {
  key: string;
  title: string;
  href: string;
  contentType: string;
  dateLabel: string;
};

function resolveItems(items: NewsListingTarget[] | undefined): ResolvedNewsItem[] {
  if (!items?.length) return [];
  return items.map((item, index) => ({
    key: item.id || `${item.name || 'item'}-${index}`,
    title: itemTitle(item),
    href: itemHref(item),
    contentType: contentTypeFromParent(item.parent?.name),
    dateLabel: itemDate(item),
  }));
}

function NewsCard({
  item,
  isEditing,
}: {
  item: ResolvedNewsItem;
  isEditing: boolean;
}) {
  const meta = [item.contentType, item.dateLabel].filter(Boolean).join(' ');
  const body = (
    <>
      <span className="bg-primary mb-4 block h-px w-6 shrink-0" aria-hidden />
      <h3 className="font-heading text-primary text-xl leading-snug tracking-tight sm:text-[1.35rem] sm:leading-[1.35]">
        {item.title}
      </h3>
      {meta ? (
        <p className="text-primary mt-auto pt-6 text-xs font-medium tracking-wide">{meta}</p>
      ) : null}
    </>
  );

  const className =
    'flex h-full min-h-[11rem] flex-col border-0 bg-transparent p-0 text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/40';

  if (isEditing || item.href === '#') {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link href={item.href} className={className}>
      {body}
    </Link>
  );
}

export const Default: React.FC<NewsListingProps> = (props) => {
  const { page } = useSitecore();
  const isEditing = Boolean(props.isPageEditing || page?.mode?.isEditing);
  const datasource = props.fields?.data?.datasource;

  const eyebrow = fieldString(datasource?.eyebrow);
  const title = fieldString(datasource?.title);
  const items = useMemo(
    () => resolveItems(datasource?.items?.targetItems),
    [datasource?.items?.targetItems]
  );

  const [startIndex, setStartIndex] = useState(0);
  const maxStart = Math.max(0, items.length - VISIBLE_DESKTOP);
  const canPrev = startIndex > 0;
  const canNext = startIndex < maxStart;

  const visible = items.slice(startIndex, startIndex + VISIBLE_DESKTOP);

  if (!datasource) {
    return <NoDataFallback componentName="NewsListing" />;
  }

  if (!items.length && !isEditing) {
    return null;
  }

  return (
    <section
      data-component="NewsListing"
      className={cn('@container bg-background text-primary', props.params?.styles)}
      aria-labelledby={title || isEditing ? 'news-listing-title' : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {(eyebrow || isEditing) && (
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-primary h-3.5 w-0.5 shrink-0" aria-hidden />
                {datasource.eyebrow?.jsonValue ? (
                  <Text
                    tag="p"
                    field={datasource.eyebrow.jsonValue}
                    className="text-primary text-[11px] font-semibold uppercase tracking-[0.14em]"
                  />
                ) : (
                  <p className="text-primary text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Firm News
                  </p>
                )}
              </div>
            )}
            {(title || isEditing) && datasource.title?.jsonValue ? (
              <Text
                tag="h2"
                id="news-listing-title"
                field={datasource.title.jsonValue}
                className="font-heading text-primary text-4xl tracking-tight sm:text-5xl"
              />
            ) : title ? (
              <h2
                id="news-listing-title"
                className="font-heading text-primary text-4xl tracking-tight sm:text-5xl"
              >
                {title}
              </h2>
            ) : null}
          </div>

          {items.length > VISIBLE_DESKTOP ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous news items"
                disabled={!canPrev}
                onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
                className={cn(
                  'text-primary inline-flex size-10 items-center justify-center transition-opacity',
                  !canPrev && 'cursor-not-allowed opacity-30'
                )}
              >
                <ChevronLeft className="size-7 stroke-[1.25]" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next news items"
                disabled={!canNext}
                onClick={() => setStartIndex((i) => Math.min(maxStart, i + 1))}
                className={cn(
                  'text-primary inline-flex size-10 items-center justify-center transition-opacity',
                  !canNext && 'cursor-not-allowed opacity-30'
                )}
              >
                <ChevronRight className="size-7 stroke-[1.25]" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>

        {items.length ? (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {(isEditing ? items : visible).map((item) => (
              <li key={item.key} className="min-w-0">
                <NewsCard item={item} isEditing={isEditing} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-primary/20 text-primary/70 mt-8 rounded-xl border border-dashed px-4 py-8 text-sm">
            Select Media and Insight pages in Featured Items to populate this carousel.
          </p>
        )}
      </div>
    </section>
  );
};

export default Default;
