'use client';

import { useEffect, useMemo, useState, type JSX } from 'react';
import Link from 'next/link';
import { Text, type Field } from '@sitecore-content-sdk/nextjs';
import { ChevronLeft, ChevronRight, MapPin, Phone, Search, Stethoscope } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

/** Matches the 3-column card grid (3×3). */
export const DEFAULT_PAGE_SIZE = 9;

export type PhysicianListingJsonField<T = string> = {
  jsonValue?: Field<T>;
};

export type PhysicianListingLocation = {
  id?: string;
  name?: string;
  displayName?: string;
  locationTitle?: PhysicianListingJsonField;
};

export type PhysicianListingChild = {
  id?: string;
  name?: string;
  url?: { path?: string };
  physicianFullName?: PhysicianListingJsonField;
  credentials?: PhysicianListingJsonField;
  specialty?: PhysicianListingJsonField;
  physicianPhone?: PhysicianListingJsonField;
  physicianDetailPage?: PhysicianListingJsonField<
    string | { href?: string; url?: string; path?: string }
  > & {
    targetItem?: { id?: string; name?: string; url?: { path?: string } };
  };
  servingLocations?: {
    jsonValue?: Field<string> | PhysicianListingLocation[];
    targetItems?: PhysicianListingLocation[];
  };
};

export type PhysicianListingPageInfo = {
  hasNext?: boolean;
  endCursor?: string | null;
};

export type PhysicianListingDatasource = {
  id?: string;
  name?: string;
  children?: {
    total?: number;
    pageInfo?: PhysicianListingPageInfo;
    results?: PhysicianListingChild[];
  };
};

export type PhysicianListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: PhysicianListingDatasource | null;
    };
  };
};

export function hasAssignedPhysicianListingDatasource(
  fields?: PhysicianListingProps['fields'] | null,
  rendering?: { dataSource?: string } | null
): boolean {
  if (fields?.data?.datasource) return true;
  return Boolean(rendering?.dataSource?.trim());
}

const PhysicianListingEmpty = (): JSX.Element => (
  <NoDataFallback componentName="PhysicianListing" />
);

function textValue(field?: PhysicianListingJsonField | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function locationName(item: PhysicianListingLocation): string {
  return textValue(item.locationTitle) || item.displayName || item.name || '';
}

function servingLocationNames(physician: PhysicianListingChild): string[] {
  const fromTargets = (physician.servingLocations?.targetItems ?? [])
    .map(locationName)
    .filter(Boolean);
  if (fromTargets.length) return fromTargets;

  const jsonValue = physician.servingLocations?.jsonValue;
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(locationName).filter(Boolean);
  }

  return [];
}

function detailHref(physician: PhysicianListingChild): string {
  const linkedPath = physician.physicianDetailPage?.targetItem?.url?.path?.trim();
  if (linkedPath) {
    return linkedPath.startsWith('/') ? linkedPath : `/${linkedPath}`;
  }

  const fromUrl = physician.url?.path?.trim();
  if (fromUrl && fromUrl.includes('/Find-a-Provider/')) {
    return fromUrl.startsWith('/') ? fromUrl : `/${fromUrl}`;
  }

  const detailValue = physician.physicianDetailPage?.jsonValue?.value;
  if (typeof detailValue === 'string') {
    const trimmed = detailValue.trim();
    if (trimmed.startsWith('/')) return trimmed;
  } else if (detailValue && typeof detailValue === 'object') {
    const href = detailValue.href || detailValue.url || detailValue.path;
    if (typeof href === 'string' && href.trim()) {
      return href.startsWith('/') ? href : `/${href}`;
    }
  }

  const segment = (physician.name || textValue(physician.physicianFullName) || '')
    .trim()
    .replace(/\s+/g, '-');
  return segment ? `/Find-a-Provider/${segment}` : '/Find-a-Provider';
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function physicianDisplayName(physician: PhysicianListingChild): string {
  return textValue(physician.physicianFullName) || physician.name || '';
}

function matchesFilters(
  physician: PhysicianListingChild,
  search: string,
  specialty: string,
  location: string
): boolean {
  const name = physicianDisplayName(physician).toLowerCase();
  const needle = search.trim().toLowerCase();
  if (needle && !name.includes(needle)) return false;

  const spec = textValue(physician.specialty);
  if (specialty && spec !== specialty) return false;

  if (location) {
    const locations = servingLocationNames(physician);
    if (!locations.includes(location)) return false;
  }

  return true;
}

const selectClassName = cn(
  'border-input bg-background ring-offset-background text-foreground',
  'focus-visible:ring-ring rounded-default flex h-10 w-full border px-3 py-2 text-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

export const Default = (props: PhysicianListingProps): JSX.Element => {
  const { fields, params, page, rendering } = props;
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};
  const datasource = fields?.data?.datasource;
  const datasourceAssigned = hasAssignedPhysicianListingDatasource(fields, rendering);
  const inlinePhysicians = datasource?.children?.results ?? [];
  const datasourceId = rendering?.dataSource?.trim() ?? '';
  const language =
    (page?.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';
  const [remotePhysicians, setRemotePhysicians] = useState<PhysicianListingChild[]>([]);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  useEffect(() => {
    if (inlinePhysicians.length > 0 || !datasourceId) return;

    const controller = new AbortController();
    const query = new URLSearchParams({
      datasource: datasourceId,
      language,
    });
    if (isEditing) query.set('preview', '1');

    setIsLoadingRemote(true);
    fetch(`/api/physician-listing?${query.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          console.error('[PhysicianListing] /api/physician-listing failed', response.status);
          return { physicians: [] as PhysicianListingChild[] };
        }
        return response.json() as Promise<{ physicians?: PhysicianListingChild[] }>;
      })
      .then((payload) => {
        if (payload?.physicians?.length) setRemotePhysicians(payload.physicians);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== 'AbortError') {
          console.error('[PhysicianListing] failed to load physicians', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingRemote(false);
      });

    return () => controller.abort();
  }, [inlinePhysicians.length, datasourceId, language, isEditing]);

  const physicians = inlinePhysicians.length > 0 ? inlinePhysicians : remotePhysicians;
  const edgeTotal = datasource?.children?.total ?? (physicians.length || undefined);
  const hasMoreOnEdge =
    inlinePhysicians.length > 0
      ? Boolean(datasource?.children?.pageInfo?.hasNext)
      : false;

  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const specialties = useMemo(
    () => uniqueSorted(physicians.map((physician) => textValue(physician.specialty))),
    [physicians]
  );
  const locations = useMemo(
    () => uniqueSorted(physicians.flatMap(servingLocationNames)),
    [physicians]
  );

  const filtered = useMemo(
    () =>
      physicians.filter((physician) =>
        matchesFilters(physician, searchQuery, specialtyFilter, locationFilter)
      ),
    [physicians, searchQuery, specialtyFilter, locationFilter]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / DEFAULT_PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * DEFAULT_PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + DEFAULT_PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : pageStart + 1;
  const showingTo = pageStart + paged.length;
  const hasActiveFilters = Boolean(searchQuery.trim() || specialtyFilter || locationFilter);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value);
    setCurrentPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSpecialtyFilter('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  if (!datasource && !datasourceAssigned) {
    return <PhysicianListingEmpty />;
  }

  if (!physicians.length && !isEditing && !isLoadingRemote && !datasourceAssigned) {
    return <PhysicianListingEmpty />;
  }

  return (
    <section
      className={cn('component physician-listing @container w-full bg-background py-10', styles)}
      id={RenderingIdentifier}
      data-component="PhysicianListing"
    >
      <div className="component-content mx-auto max-w-6xl px-4 md:px-8">
        {physicians.length > 0 && (
          <div className="mb-8 space-y-4">
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="search"
              aria-label="Filter physicians"
            >
              <div className="space-y-2">
                <Label htmlFor="physician-listing-search">Search by name</Label>
                <div className="relative">
                  <Search
                    aria-hidden
                    className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  />
                  <Input
                    id="physician-listing-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search by name"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="physician-listing-specialty">Specialty</Label>
                <select
                  id="physician-listing-specialty"
                  value={specialtyFilter}
                  onChange={(event) => handleSpecialtyChange(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">All specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="physician-listing-location">Location</Label>
                <select
                  id="physician-listing-location"
                  value={locationFilter}
                  onChange={(event) => handleLocationChange(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">All locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm" data-testid="physician-listing-count">
                {filtered.length === 0
                  ? 'No matching physicians'
                  : `Showing ${showingFrom}–${showingTo} of ${filtered.length}`}
              </p>
              {hasActiveFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
            {hasMoreOnEdge && (
              <p className="text-muted-foreground text-xs">
                Additional physicians exist beyond the {physicians.length} loaded
                {typeof edgeTotal === 'number' ? ` (Edge total ${edgeTotal})` : ''}.
              </p>
            )}
          </div>
        )}

        {paged.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((physician, index) => {
              const name = physicianDisplayName(physician);
              const credentials = textValue(physician.credentials);
              const specialty = textValue(physician.specialty);
              const phone = textValue(physician.physicianPhone);
              const physicianLocations = servingLocationNames(physician);
              const href = detailHref(physician);
              if (!name && !credentials && !specialty && !isEditing) return null;

              return (
                <li key={physician.id || `${name}-${index}`}>
                  <Card className="h-full transition-colors hover:bg-muted/30">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="space-y-2">
                        {specialty && (
                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {specialty}
                          </Badge>
                        )}
                        {isEditing ? (
                          <Text
                            field={physician.physicianFullName?.jsonValue}
                            tag="h2"
                            className="text-foreground text-xl font-semibold tracking-tight"
                          />
                        ) : (
                          <h2 className="text-foreground text-xl font-semibold tracking-tight">
                            <Link href={href} className="hover:underline">
                              {name}
                            </Link>
                          </h2>
                        )}
                        {(credentials || isEditing) && (
                          <Text
                            field={physician.credentials?.jsonValue}
                            tag="p"
                            className="text-muted-foreground text-sm"
                          />
                        )}
                      </div>

                      <div className="text-muted-foreground mt-auto space-y-2 text-sm">
                        {(specialty || isEditing) && (
                          <p className="flex items-start gap-2">
                            <Stethoscope aria-hidden className="mt-0.5 size-4 shrink-0" />
                            <Text field={physician.specialty?.jsonValue} tag="span" />
                          </p>
                        )}
                        {(phone || isEditing) && (
                          <p className="flex items-start gap-2">
                            <Phone aria-hidden className="mt-0.5 size-4 shrink-0" />
                            {phone && !isEditing ? (
                              <a href={telHref(phone)} className="hover:underline">
                                <Text field={physician.physicianPhone?.jsonValue} tag="span" />
                              </a>
                            ) : (
                              <Text field={physician.physicianPhone?.jsonValue} tag="span" />
                            )}
                          </p>
                        )}
                        {physicianLocations.length > 0 && (
                          <p className="flex items-start gap-2">
                            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                            <span>{physicianLocations.join(', ')}</span>
                          </p>
                        )}
                      </div>

                      {!isEditing && name && (
                        <Link
                          href={href}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          View profile
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : physicians.length > 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No physicians match your search. Try a different name, specialty, or location.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm" data-testid="physician-listing-empty">
            {isLoadingRemote
              ? 'Loading physicians…'
              : datasourceAssigned
                ? 'No physicians found under this datasource. Add physician items under Data/Physicians.'
                : 'Assign the Physicians folder as the datasource, then add or edit physician items under Data/Physicians.'}
          </p>
        )}

        {filtered.length > DEFAULT_PAGE_SIZE && (
          <nav
            className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
            aria-label="Physician listing pagination"
          >
            <p className="text-muted-foreground text-sm">
              Page {safePage} of {pageCount}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeft aria-hidden className="size-4" />
                Previous
              </Button>
              {Array.from({ length: pageCount }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={pageNumber === safePage ? 'default' : 'outline'}
                    size="sm"
                    aria-current={pageNumber === safePage ? 'page' : undefined}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((value) => Math.min(pageCount, value + 1))}
                disabled={safePage >= pageCount}
              >
                Next
                <ChevronRight aria-hidden className="size-4" />
              </Button>
            </div>
          </nav>
        )}
      </div>
    </section>
  );
};
