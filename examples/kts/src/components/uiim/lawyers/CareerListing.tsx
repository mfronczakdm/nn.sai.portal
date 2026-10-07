'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Field,
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { Briefcase, ChevronRight, MapPin, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type {
  CareerListingProps,
  CareerListingRole,
} from './career-listing.props';

/** McKinsey-style hover shared with BioListing / MultiPromo cards. */
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

function roleHref(role: CareerListingRole): string {
  const path = role.url?.path?.trim();
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}

function roleTitle(role: CareerListingRole): string {
  return (
    fieldValue(role.pageHeaderTitle) ||
    fieldValue(role.pageTitle) ||
    role.name?.replace(/-/g, ' ') ||
    'Open role'
  );
}

function roleTrack(role: CareerListingRole): string {
  return fieldValue(role.pageShortTitle);
}

function roleLocation(role: CareerListingRole): string {
  const subtitle = fieldValue(role.pageSubtitle);
  if (!subtitle) return '';
  const beforeSep = subtitle.split(/[·|–—]/)[0]?.trim() ?? '';
  return beforeSep || subtitle;
}

type ResolvedRole = {
  key: string;
  title: string;
  track: string;
  location: string;
  summary: string;
  subtitle: string;
  href: string;
};

function resolveRole(role: CareerListingRole): ResolvedRole {
  return {
    key: role.id || role.name || roleTitle(role),
    title: roleTitle(role),
    track: roleTrack(role),
    location: roleLocation(role),
    summary: fieldValue(role.pageSummary),
    subtitle: fieldValue(role.pageSubtitle),
    href: roleHref(role),
  };
}

const CareerListingEmpty: React.FC<{ message: string }> = ({ message }) => (
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

function CardItem({ role }: { role: ResolvedRole }) {
  return (
    <li>
      <Link
        href={role.href}
        className={cn(
          'group border-border bg-background flex h-full flex-col border p-5 no-underline',
          hoverSurfaceClassName
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-lg">
            <Briefcase className="size-5" aria-hidden />
          </span>
          {role.track && (
            <span className="border-border rounded-md border px-2 py-0.5 text-xs opacity-90">
              {role.track}
            </span>
          )}
        </div>

        <h2 className="font-heading mb-2 flex items-center gap-1 text-xl font-semibold tracking-tight lg:text-2xl">
          {role.title}
          <HoverChevron />
        </h2>

        {(role.location || role.subtitle) && (
          <p className="mb-3 inline-flex items-start gap-1.5 text-sm opacity-70">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>{role.subtitle || role.location}</span>
          </p>
        )}

        {role.summary && (
          <p className="mt-auto line-clamp-3 text-sm leading-relaxed opacity-70">{role.summary}</p>
        )}
      </Link>
    </li>
  );
}

export const Default: React.FC<CareerListingProps> = (props) => {
  const { fields, params, isPageEditing: propEditing } = props;
  const { page } = useSitecore();
  const isEditing = propEditing ?? page.mode.isEditing;

  const datasource = fields?.data?.datasource;
  const roles = datasource?.careersRoot?.targetItem?.children?.results ?? [];

  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('all');
  const [location, setLocation] = useState('all');

  const trackOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const role of roles) {
      const label = roleTrack(role);
      if (label) map.set(label, label);
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [roles]);

  const locationOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const role of roles) {
      const label = roleLocation(role);
      if (label) map.set(label, label);
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [roles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles
      .filter((role) => {
        const title = roleTitle(role);
        const trackLabel = roleTrack(role);
        const locationLabel = roleLocation(role);
        const summary = fieldValue(role.pageSummary);
        const subtitle = fieldValue(role.pageSubtitle);

        if (track !== 'all' && trackLabel !== track) return false;
        if (location !== 'all' && locationLabel !== location) return false;

        if (!q) return true;
        const haystack = [title, trackLabel, locationLabel, summary, subtitle, role.name || '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => roleTitle(a).localeCompare(roleTitle(b)))
      .map(resolveRole);
  }, [roles, track, location, query]);

  if (!datasource) {
    return <NoDataFallback componentName="CareerListing" />;
  }

  const showFilters = isChecked(datasource.showFilters) || isEditing;
  const emptyText = fieldValue(datasource.emptyResultsText) || 'No openings match your filters.';
  const sectionId = params?.RenderingIdentifier || 'career-listing';
  const hasActiveFilters = query.trim() !== '' || track !== 'all' || location !== 'all';

  return (
    <section
      id={sectionId}
      data-component="CareerListing"
      data-variant="Default"
      className={cn('@container bg-background text-foreground', params?.styles)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-3xl">
          {(fieldValue(datasource.title) || isEditing) && (
            <Text
              tag="h2"
              field={datasource.title?.jsonValue}
              className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
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
                <span className="sr-only">Search careers</span>
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by role, practice, or keyword"
                  className="bg-background h-11 pl-9"
                />
              </label>

              <label className="block">
                <span className="sr-only">Track</span>
                <select
                  value={track}
                  onChange={(event) => setTrack(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                >
                  <option value="all">All tracks</option>
                  {trackOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="sr-only">Location</span>
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                >
                  <option value="all">All locations</option>
                  {locationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  setTrack('all');
                  setLocation('all');
                }}
              >
                <X className="size-4" aria-hidden />
                Clear
              </Button>
            </div>

            <p className="text-muted-foreground mt-3 text-sm">
              Showing {filtered.length} of {roles.length} openings
            </p>
          </div>
        )}

        {filtered.length === 0 ? (
          <CareerListingEmpty
            message={
              isEditing && roles.length === 0
                ? 'Select a Careers Root folder that contains career pages.'
                : emptyText
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((role) => (
              <CardItem key={role.key} role={role} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
