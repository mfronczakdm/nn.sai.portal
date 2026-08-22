'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Field,
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight, Mail, MapPin, Phone, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type {
  BioListingAttorney,
  BioListingProps,
  BioListingTaxonomyItem,
} from './bio-listing.props';
import { resolveBioHeadshotSrc } from './bio-headshots';

/** McKinsey-style hover shared with MultiPromo Default cards. */
const hoverSurfaceClassName =
  'transition-colors duration-300 hover:bg-white hover:text-neutral-950';

function fieldValue(field?: { jsonValue?: Field<string> } | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function isChecked(field?: { jsonValue?: Field<boolean | string> } | null): boolean {
  const value = field?.jsonValue?.value;
  return value === true || value === '1' || value === 'true';
}

function practiceLabel(item: BioListingTaxonomyItem): string {
  return fieldValue(item.title) || item.displayName || item.name || '';
}

function officeLabel(attorney: BioListingAttorney): string {
  const office = attorney.office?.targetItem;
  if (!office) return '';
  return office.displayName || office.name || '';
}

function attorneyHref(attorney: BioListingAttorney): string {
  const path = attorney.url?.path?.trim();
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

type ResolvedAttorney = {
  key: string;
  itemName: string;
  name: string;
  title: string;
  summary: string;
  phone: string;
  email: string;
  officeName: string;
  practices: string[];
  href: string;
  headshotSrc: string;
  headshotAlt: string;
};

function resolveAttorney(attorney: BioListingAttorney): ResolvedAttorney {
  const name = fieldValue(attorney.fullName) || attorney.name || 'Attorney';
  const itemName = attorney.name || '';
  const headshot = resolveBioHeadshotSrc({
    itemName,
    displayName: name,
    headshotField: attorney.headshot,
  });
  return {
    key: attorney.id || name,
    itemName,
    name,
    title: fieldValue(attorney.jobTitle),
    summary: fieldValue(attorney.summary),
    phone: fieldValue(attorney.phone),
    email: fieldValue(attorney.email),
    officeName: officeLabel(attorney),
    practices: (attorney.practiceAreas?.targetItems ?? []).map(practiceLabel).filter(Boolean),
    href: attorneyHref(attorney),
    headshotSrc: headshot.src,
    headshotAlt: headshot.alt,
  };
}

const BioListingEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="border-border bg-muted/20 text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
    {message}
  </div>
);

function HoverChevron({ className }: { className?: string }) {
  return (
    <ChevronRight
      aria-hidden
      className={cn(
        'size-5 shrink-0 transition-colors duration-300 group-hover:text-primary',
        className
      )}
    />
  );
}

function Headshot({
  name,
  src,
  alt,
  className,
}: {
  name: string;
  src: string;
  alt: string;
  className?: string;
}) {
  const bypassOptimizer =
    src.includes('images.unsplash.com') || src.includes('sitecoresandbox.cloud');

  return (
    <div
      className={cn(
        'bg-muted text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden text-sm font-semibold tracking-wide',
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name}
          fill
          sizes="128px"
          className="object-cover"
          unoptimized={bypassOptimizer}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </div>
  );
}

function RowItem({ attorney }: { attorney: ResolvedAttorney }) {
  return (
    <li>
      <Link
        href={attorney.href}
        className={cn(
          'group flex flex-col gap-4 px-4 py-5 no-underline sm:flex-row sm:items-start sm:gap-5 sm:px-6',
          hoverSurfaceClassName
        )}
      >
        <Headshot
          name={attorney.name}
          src={attorney.headshotSrc}
          alt={attorney.headshotAlt}
          className="size-16 rounded-full"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-heading flex items-center gap-1 text-xl font-semibold tracking-tight">
              {attorney.name}
              <HoverChevron />
            </h2>
            {attorney.title && <p className="text-sm opacity-70">{attorney.title}</p>}
          </div>

          {(attorney.officeName || attorney.practices.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-70">
              {attorney.officeName && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  {attorney.officeName}
                </span>
              )}
              {attorney.practices.map((label) => (
                <span
                  key={label}
                  className="border-border rounded-md border px-2 py-0.5 text-xs opacity-90"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {attorney.summary && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed opacity-70">{attorney.summary}</p>
          )}

          {(attorney.phone || attorney.email) && (
            <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-70">
              {attorney.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5" aria-hidden />
                  {attorney.phone}
                </span>
              )}
              {attorney.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" aria-hidden />
                  {attorney.email}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

function CardItem({ attorney }: { attorney: ResolvedAttorney }) {
  return (
    <li>
      <Link
        href={attorney.href}
        className={cn(
          'group border-border bg-background flex h-full flex-col border p-5 no-underline',
          hoverSurfaceClassName
        )}
      >
        <Headshot
          name={attorney.name}
          src={attorney.headshotSrc}
          alt={attorney.headshotAlt}
          className="mb-5 aspect-[4/3] w-full rounded-none text-2xl"
        />

        <h2 className="font-heading mb-2 flex items-center gap-1 text-xl font-semibold tracking-tight lg:text-2xl">
          {attorney.name}
          <HoverChevron />
        </h2>

        {attorney.title && <p className="mb-3 text-sm opacity-70">{attorney.title}</p>}

        {attorney.officeName && (
          <p className="mb-3 inline-flex items-center gap-1.5 text-sm opacity-70">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {attorney.officeName}
          </p>
        )}

        {attorney.practices.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {attorney.practices.map((label) => (
              <span key={label} className="border-border rounded-md border px-2 py-0.5 text-xs">
                {label}
              </span>
            ))}
          </div>
        )}

        {attorney.summary && (
          <p className="mt-auto line-clamp-3 text-sm leading-relaxed opacity-70">{attorney.summary}</p>
        )}
      </Link>
    </li>
  );
}

type LayoutMode = 'rows' | 'cards';

function BioListingView({ props, layout }: { props: BioListingProps; layout: LayoutMode }) {
  const { fields, params, isPageEditing: propEditing } = props;
  const { page } = useSitecore();
  const isEditing = propEditing ?? page.mode.isEditing;

  const datasource = fields?.data?.datasource;
  const attorneys = datasource?.biosRoot?.targetItem?.children?.results ?? [];

  const [query, setQuery] = useState('');
  const [practice, setPractice] = useState('all');
  const [office, setOffice] = useState('all');

  const practiceOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const attorney of attorneys) {
      for (const item of attorney.practiceAreas?.targetItems ?? []) {
        const label = practiceLabel(item);
        const id = item.id || label;
        if (label) map.set(id, label);
      }
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [attorneys]);

  const officeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const attorney of attorneys) {
      const label = officeLabel(attorney);
      const id = attorney.office?.targetItem?.id || label;
      if (label) map.set(id, label);
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [attorneys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return attorneys
      .filter((attorney) => {
        const name = fieldValue(attorney.fullName) || attorney.name || '';
        const title = fieldValue(attorney.jobTitle);
        const summary = fieldValue(attorney.summary);
        const officeName = officeLabel(attorney);
        const practices = (attorney.practiceAreas?.targetItems ?? []).map(practiceLabel);

        if (practice !== 'all') {
          const match = (attorney.practiceAreas?.targetItems ?? []).some(
            (item) => (item.id || practiceLabel(item)) === practice
          );
          if (!match) return false;
        }

        if (office !== 'all') {
          const officeId = attorney.office?.targetItem?.id || officeName;
          if (officeId !== office) return false;
        }

        if (!q) return true;
        const haystack = [name, title, summary, officeName, ...practices].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) =>
        (fieldValue(a.fullName) || a.name || '').localeCompare(fieldValue(b.fullName) || b.name || '')
      )
      .map(resolveAttorney);
  }, [attorneys, office, practice, query]);

  if (!datasource) {
    return <NoDataFallback componentName="BioListing" />;
  }

  const showFilters = isChecked(datasource.showFilters) || isEditing;
  const emptyText = fieldValue(datasource.emptyResultsText) || 'No lawyers match your filters.';
  const sectionId = params?.RenderingIdentifier || 'bio-listing';
  const hasActiveFilters = query.trim() !== '' || practice !== 'all' || office !== 'all';

  return (
    <section
      id={sectionId}
      data-component="BioListing"
      data-variant={layout === 'cards' ? 'Cards' : 'Default'}
      className={cn('@container bg-background text-foreground', params?.styles)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-3xl">
          {(fieldValue(datasource.title) || isEditing) && (
            <Text
              tag="h1"
              field={datasource.title?.jsonValue}
              className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
            />
          )}
          {(datasource.intro?.jsonValue?.value || isEditing) && (
            <div className="mt-4 text-pretty text-base leading-relaxed opacity-70 sm:text-lg">
              <ContentSdkRichText field={datasource.intro?.jsonValue} />
            </div>
          )}
        </header>

        {showFilters && (
          <div className="border-border bg-muted/20 mb-8 rounded-2xl border p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Search lawyers</span>
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, practice, or keyword"
                  className="bg-background h-11 pl-9"
                />
              </label>

              <label className="block">
                <span className="sr-only">Practice area</span>
                <select
                  value={practice}
                  onChange={(event) => setPractice(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                >
                  <option value="all">All practice areas</option>
                  {practiceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="sr-only">Office</span>
                <select
                  value={office}
                  onChange={(event) => setOffice(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                >
                  <option value="all">All offices</option>
                  {officeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={!hasActiveFilters}
                onClick={() => {
                  setQuery('');
                  setPractice('all');
                  setOffice('all');
                }}
              >
                <X className="size-4" aria-hidden />
                Clear
              </Button>
            </div>

            <p className="text-muted-foreground mt-3 text-sm">
              Showing {filtered.length} of {attorneys.length} lawyers
            </p>
          </div>
        )}

        {filtered.length === 0 ? (
          <BioListingEmpty
            message={
              isEditing && attorneys.length === 0
                ? 'Select a Bios Root folder that contains Bio pages.'
                : emptyText
            }
          />
        ) : layout === 'cards' ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((attorney) => (
              <CardItem key={attorney.key} attorney={attorney} />
            ))}
          </ul>
        ) : (
          <ul className="divide-border border-border divide-y overflow-hidden rounded-2xl border">
            {filtered.map((attorney) => (
              <RowItem key={attorney.key} attorney={attorney} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export const Default: React.FC<BioListingProps> = (props) => (
  <BioListingView props={props} layout="rows" />
);

export const Cards: React.FC<BioListingProps> = (props) => (
  <BioListingView props={props} layout="cards" />
);
