'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Field, LinkField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
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
  /**
   * Raw Sitecore image XML. The demo pages point at external URLs, which Edge drops from
   * `jsonValue`, so the ComponentQuery asks for `value` and the src is parsed here.
   */
  image?: { value?: string };
  parent?: { name?: string };
};

type NewsListingDatasource = {
  eyebrow?: JsonField<Field<string>>;
  title?: JsonField<Field<string>>;
  ctaLink?: JsonField<LinkField>;
  ctaText?: JsonField<Field<string>>;
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
  Blog: 'Blog',
  News: 'News',
};

const VISIBLE_DESKTOP = 4;

function fieldString(field?: JsonField<Field<string>> | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function humanizeName(name?: string): string {
  if (!name?.trim()) return 'Untitled';
  return name.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
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
  imageSrc: string;
  imageAlt: string;
};

function attributeValue(xml: string, attribute: string): string {
  const match = xml.match(new RegExp(`${attribute}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function itemImage(item: NewsListingTarget): { src: string; alt: string } {
  const xml = item.image?.value?.trim();
  if (!xml) return { src: '', alt: '' };
  return { src: attributeValue(xml, 'src'), alt: attributeValue(xml, 'alt') };
}

function resolveItems(items: NewsListingTarget[] | undefined): ResolvedNewsItem[] {
  if (!items?.length) return [];
  return items.map((item, index) => {
    const image = itemImage(item);
    return {
      key: item.id || `${item.name || 'item'}-${index}`,
      title: itemTitle(item),
      href: itemHref(item),
      contentType: contentTypeFromParent(item.parent?.name),
      dateLabel: itemDate(item),
      imageSrc: image.src,
      imageAlt: image.alt,
    };
  });
}

type ResolvedCta = { href: string; label: string; target?: string };

function resolveCta(datasource?: NewsListingDatasource | null): ResolvedCta | null {
  const link = datasource?.ctaLink?.jsonValue?.value;
  const href = link?.href?.trim();
  if (!href) return null;
  const label = fieldString(datasource?.ctaText) || link?.text?.trim() || 'View all';
  return { href, label, target: link?.target || undefined };
}

function NewsCard({ item, isEditing }: { item: ResolvedNewsItem; isEditing: boolean }) {
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
                    Company News
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
            Select blog or news pages in Featured Items to populate this carousel.
          </p>
        )}
      </div>
    </section>
  );
};

export default Default;

/* -------------------------------------------------------------------------------------------------
 * Card and list variants
 *
 * Layout mirrors amkor.com's "Latest Blog Posts" / "Upcoming Events" / "Latest Press Releases"
 * tiers. Colours come from theme tokens (see globals.css `.news-card-*` / `[data-news-accent]`),
 * so other skins inherit their own accent rather than Amkor's teal and magenta.
 * ---------------------------------------------------------------------------------------------- */

const CTA_CLASSES =
  'news-listing-cta inline-flex h-[51px] w-60 max-w-full items-center justify-center text-base font-bold uppercase tracking-wide transition-colors';

function CtaButton({ cta, isEditing }: { cta: ResolvedCta | null; isEditing: boolean }) {
  if (!cta) return null;

  if (isEditing) {
    return (
      <div className="mt-10 flex justify-center">
        <span className={CTA_CLASSES}>{cta.label}</span>
      </div>
    );
  }

  return (
    <div className="mt-10 flex justify-center">
      <Link
        href={cta.href}
        target={cta.target}
        rel={cta.target === '_blank' ? 'noopener noreferrer' : undefined}
        className={CTA_CLASSES}
      >
        {cta.label}
      </Link>
    </div>
  );
}

function SectionHeading({
  datasource,
  title,
  isEditing,
  accent,
  headingId,
}: {
  datasource: NewsListingDatasource;
  title: string;
  isEditing: boolean;
  accent: NewsAccent;
  headingId: string;
}) {
  const className = cn(
    'font-heading text-center text-3xl tracking-tight sm:text-4xl',
    accent === 'events' ? 'news-listing-heading--events' : 'news-listing-heading'
  );

  if (datasource.title?.jsonValue && (title || isEditing)) {
    return (
      <Text tag="h2" id={headingId} field={datasource.title.jsonValue} className={className} />
    );
  }

  if (!title) return null;

  return (
    <h2 id={headingId} className={className}>
      {title}
    </h2>
  );
}

type NewsAccent = 'news' | 'events';

function NewsImageCard({
  item,
  isEditing,
  accent,
}: {
  item: ResolvedNewsItem;
  isEditing: boolean;
  accent: NewsAccent;
}) {
  const isLinked = !isEditing && item.href !== '#';

  const media = item.imageSrc ? (
    <div className="group relative aspect-[16/9] w-full overflow-hidden">
      <NextImage
        src={item.imageSrc}
        alt={item.imageAlt}
        fill
        sizes="(min-width: 992px) 33vw, (min-width: 576px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  ) : (
    <div className="bg-muted aspect-[16/9] w-full" aria-hidden />
  );

  // amkor.com shows a category link on blog tiles only; event tiles carry the date alone.
  const category = accent === 'news' ? item.contentType : '';

  const body = (
    <>
      <h3 className="news-card-title px-4 py-6 text-[1.3125rem] font-light leading-7 lg:pl-11 lg:pr-14">
        {item.title}
      </h3>
      {item.dateLabel || category ? (
        <div className="mt-auto space-y-1 px-4 pb-6 lg:pl-11 lg:pr-14">
          {item.dateLabel ? (
            <span
              className={cn(
                'block text-base font-semibold uppercase',
                accent === 'events' ? 'news-card-date--events' : 'news-card-date'
              )}
            >
              {item.dateLabel}
            </span>
          ) : null}
          {category ? (
            <span className="news-card-category block text-base underline">{category}</span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      data-news-accent={accent}
      className={cn(
        'bg-card flex h-full flex-col',
        accent === 'events' ? 'lg:min-h-[419px]' : 'lg:min-h-[380px]'
      )}
    >
      {isLinked ? (
        <Link href={item.href} className="focus-visible:ring-ring block focus-visible:ring-2">
          {media}
        </Link>
      ) : (
        media
      )}
      {isLinked ? (
        <Link
          href={item.href}
          className="flex flex-1 flex-col text-left transition-opacity hover:opacity-80"
        >
          {body}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">{body}</div>
      )}
    </div>
  );
}

function NewsCardGrid({ props, accent }: { props: NewsListingProps; accent: NewsAccent }) {
  const { page } = useSitecore();
  const isEditing = Boolean(props.isPageEditing || page?.mode?.isEditing);
  const datasource = props.fields?.data?.datasource;

  const items = useMemo(
    () => resolveItems(datasource?.items?.targetItems),
    [datasource?.items?.targetItems]
  );
  const cta = useMemo(() => resolveCta(datasource), [datasource]);

  if (!datasource) {
    return <NoDataFallback componentName="NewsListing" />;
  }

  const title = fieldString(datasource.title);
  const headingId = `news-listing-${accent}-title`;

  if (!items.length && !isEditing) {
    return null;
  }

  return (
    <section
      data-component="NewsListing"
      data-variant={accent === 'events' ? 'EventCards' : 'NewsCards'}
      className={cn('@container bg-background', props.params?.styles)}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          datasource={datasource}
          title={title}
          isEditing={isEditing}
          accent={accent}
          headingId={headingId}
        />

        {items.length ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((item) => (
              <li key={item.key} className="min-w-0">
                <NewsImageCard item={item} isEditing={isEditing} accent={accent} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-primary/20 text-primary/70 mt-8 border border-dashed px-4 py-8 text-center text-sm">
            Select pages in Featured Items to populate this section.
          </p>
        )}

        <CtaButton cta={cta} isEditing={isEditing} />
      </div>
    </section>
  );
}

/** Blog / news tier: image cards, three across, news accent. */
export const NewsCards: React.FC<NewsListingProps> = (props) => (
  <NewsCardGrid props={props} accent="news" />
);

/** Events tier: same card grid on the taller event footprint with the events accent. */
export const EventCards: React.FC<NewsListingProps> = (props) => (
  <NewsCardGrid props={props} accent="events" />
);

function PressReleaseIcon() {
  return (
    <svg
      viewBox="0 0 51 51"
      className="news-listing-link size-[51px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="10" y="5" width="27" height="41" />
      <path d="M37 14h5v27a5 5 0 0 1-5 5" />
      <path d="M16 15h15M16 22h15M16 29h15M16 36h9" strokeWidth="1.5" />
    </svg>
  );
}

/** Press release tier: icon + title + publish date rows instead of cards. */
export const PressReleaseList: React.FC<NewsListingProps> = (props) => {
  const { page } = useSitecore();
  const isEditing = Boolean(props.isPageEditing || page?.mode?.isEditing);
  const datasource = props.fields?.data?.datasource;

  const items = useMemo(
    () => resolveItems(datasource?.items?.targetItems),
    [datasource?.items?.targetItems]
  );
  const cta = useMemo(() => resolveCta(datasource), [datasource]);

  if (!datasource) {
    return <NoDataFallback componentName="NewsListing" />;
  }

  const title = fieldString(datasource.title);
  const headingId = 'news-listing-press-title';

  if (!items.length && !isEditing) {
    return null;
  }

  return (
    <section
      data-component="NewsListing"
      data-variant="PressReleaseList"
      className={cn('@container bg-background', props.params?.styles)}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          datasource={datasource}
          title={title}
          isEditing={isEditing}
          accent="news"
          headingId={headingId}
        />

        {items.length ? (
          <ul className="mt-10 space-y-6">
            {items.map((item) => (
              <li key={item.key} className="flex items-start gap-4">
                <PressReleaseIcon />
                <div className="min-w-0 pt-1">
                  {isEditing || item.href === '#' ? (
                    <span className="news-listing-link block text-lg font-semibold">
                      {item.title}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="news-listing-link block text-lg font-semibold hover:underline"
                    >
                      {item.title}
                    </Link>
                  )}
                  {item.dateLabel ? (
                    <span className="text-muted-foreground mt-1 block text-lg">
                      {item.dateLabel}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-primary/20 text-primary/70 mt-8 border border-dashed px-4 py-8 text-center text-sm">
            Select press release pages in Featured Items to populate this section.
          </p>
        )}

        <CtaButton cta={cta} isEditing={isEditing} />
      </div>
    </section>
  );
};
