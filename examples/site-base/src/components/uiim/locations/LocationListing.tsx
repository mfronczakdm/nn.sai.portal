'use client';

import { useEffect, useMemo, useState, type JSX } from 'react';
import Link from 'next/link';
import { Text, type Field } from '@sitecore-content-sdk/nextjs';
import { MapPin, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { parseCoordinate } from '@/lib/location-listing-map.utils';
import { LocationListingMap, type LocationListingMapItem } from './LocationListingMap.dev';

export type LocationListingJsonField<T = string> = {
  jsonValue?: Field<T>;
};

export type LocationListingChild = {
  id?: string;
  name?: string;
  url?: { path?: string };
  locationTitle?: LocationListingJsonField;
  locationShortName?: LocationListingJsonField;
  locationType?: LocationListingJsonField;
  streetAddress?: LocationListingJsonField;
  city?: LocationListingJsonField;
  state?: LocationListingJsonField;
  postalCode?: LocationListingJsonField;
  phoneNumber?: LocationListingJsonField;
  latitude?: LocationListingJsonField;
  longitude?: LocationListingJsonField;
  landingPage?: LocationListingJsonField<
    string | { href?: string; url?: string; path?: string }
  > & {
    targetItem?: { id?: string; name?: string; url?: { path?: string } };
  };
};

export type LocationListingDatasource = {
  id?: string;
  name?: string;
  children?: {
    results?: LocationListingChild[];
  };
};

export type LocationListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: LocationListingDatasource | null;
    };
  };
};

export type LocationTypeFilter = '' | 'Hospital' | 'Urgent Care';

export function hasAssignedLocationListingDatasource(
  fields?: LocationListingProps['fields'] | null,
  rendering?: { dataSource?: string } | null
): boolean {
  if (fields?.data?.datasource) return true;
  return Boolean(rendering?.dataSource?.trim());
}

const LocationListingEmpty = (): JSX.Element => <NoDataFallback componentName="LocationListing" />;

function textValue(field?: LocationListingJsonField | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

export function locationDisplayName(location: LocationListingChild): string {
  return textValue(location.locationTitle) || location.name || '';
}

export function locationTypeValue(location: LocationListingChild): string {
  return textValue(location.locationType);
}

export function formatAddress(location: LocationListingChild): string {
  const street = textValue(location.streetAddress);
  const city = textValue(location.city);
  const state = textValue(location.state);
  const postalCode = textValue(location.postalCode);
  const cityLine = [city, state].filter(Boolean).join(', ');
  return [street, [cityLine, postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export function landingHref(location: LocationListingChild): string {
  const linkedPath = location.landingPage?.targetItem?.url?.path?.trim();
  if (linkedPath) {
    return linkedPath.startsWith('/') ? linkedPath : `/${linkedPath}`;
  }

  const detailValue = location.landingPage?.jsonValue?.value;
  if (typeof detailValue === 'string') {
    const trimmed = detailValue.trim();
    if (trimmed.startsWith('/')) return trimmed;
  } else if (detailValue && typeof detailValue === 'object') {
    const href = detailValue.href || detailValue.url || detailValue.path;
    if (typeof href === 'string' && href.trim()) {
      return href.startsWith('/') ? href : `/${href}`;
    }
  }

  const segment = (location.name || locationDisplayName(location)).trim().replace(/\s+/g, '-');
  return segment ? `/Our-Locations/${segment}` : '/Our-Locations';
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function matchesTypeFilter(location: LocationListingChild, filter: LocationTypeFilter): boolean {
  if (!filter) return true;
  const type = locationTypeValue(location).toLowerCase();
  if (filter === 'Urgent Care') return type.includes('urgent');
  return type.includes('hospital') && !type.includes('urgent');
}

function toMapItem(location: LocationListingChild): LocationListingMapItem | null {
  const latitude = parseCoordinate(textValue(location.latitude));
  const longitude = parseCoordinate(textValue(location.longitude));
  if (latitude === undefined || longitude === undefined) return null;
  const name = locationDisplayName(location);
  if (!name) return null;
  return {
    id: location.id || name,
    name,
    locationType: locationTypeValue(location),
    address: formatAddress(location),
    href: landingHref(location),
    latitude,
    longitude,
  };
}

export const Default = (props: LocationListingProps): JSX.Element => {
  const { fields, params, page, rendering } = props;
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};
  const datasource = fields?.data?.datasource;
  const datasourceAssigned = hasAssignedLocationListingDatasource(fields, rendering);
  const inlineLocations = datasource?.children?.results ?? [];
  const datasourceId = rendering?.dataSource?.trim() ?? '';
  const language =
    (page?.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';
  const [remoteLocations, setRemoteLocations] = useState<LocationListingChild[]>([]);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [typeFilter, setTypeFilter] = useState<LocationTypeFilter>('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (inlineLocations.length > 0 || !datasourceId) return;

    const controller = new AbortController();
    const query = new URLSearchParams({
      datasource: datasourceId,
      language,
    });
    if (isEditing) query.set('preview', '1');

    setIsLoadingRemote(true);
    fetch(`/api/location-listing?${query.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          console.error('[LocationListing] /api/location-listing failed', response.status);
          return { locations: [] as LocationListingChild[] };
        }
        return response.json() as Promise<{ locations?: LocationListingChild[] }>;
      })
      .then((payload) => {
        if (payload?.locations?.length) setRemoteLocations(payload.locations);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== 'AbortError') {
          console.error('[LocationListing] failed to load locations', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingRemote(false);
      });

    return () => controller.abort();
  }, [inlineLocations.length, datasourceId, language, isEditing]);

  const locations = inlineLocations.length > 0 ? inlineLocations : remoteLocations;
  const filtered = useMemo(
    () => locations.filter((location) => matchesTypeFilter(location, typeFilter)),
    [locations, typeFilter]
  );
  const mapItems = useMemo(
    () =>
      filtered
        .map(toMapItem)
        .filter((item): item is LocationListingMapItem => Boolean(item)),
    [filtered]
  );

  if (!datasource && !datasourceAssigned) {
    return <LocationListingEmpty />;
  }

  if (!locations.length && !isEditing && !isLoadingRemote && !datasourceAssigned) {
    return <LocationListingEmpty />;
  }

  return (
    <section
      className={cn('component location-listing @container w-full bg-background py-10', styles)}
      id={RenderingIdentifier}
      data-component="LocationListing"
    >
      <div className="component-content mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
              All locations
            </h2>
            <p className="text-muted-foreground mt-1 text-sm" data-testid="location-listing-count">
              {isLoadingRemote && locations.length === 0
                ? 'Loading locations…'
                : filtered.length === 0
                  ? 'No matching locations'
                  : `${filtered.length} location${filtered.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter locations by type"
          >
            {(
              [
                { value: '', label: 'All' },
                { value: 'Hospital', label: 'Hospitals' },
                { value: 'Urgent Care', label: 'Urgent care' },
              ] as const
            ).map((option) => (
              <Button
                key={option.label}
                type="button"
                size="sm"
                variant={typeFilter === option.value ? 'default' : 'outline'}
                aria-pressed={typeFilter === option.value}
                onClick={() => {
                  setTypeFilter(option.value);
                  setSelectedId('');
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <LocationListingMap
            locations={mapItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {filtered.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((location, index) => {
              const name = locationDisplayName(location);
              const type = locationTypeValue(location);
              const address = formatAddress(location);
              const phone = textValue(location.phoneNumber);
              const href = landingHref(location);
              const itemId = location.id || `${name}-${index}`;
              const isSelected = selectedId === itemId;
              if (!name && !address && !phone && !isEditing) return null;

              return (
                <li key={itemId}>
                  <Card
                    className={cn(
                      'h-full transition-colors hover:bg-muted/30',
                      isSelected && 'ring-primary ring-2'
                    )}
                  >
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="space-y-2">
                        {type && (
                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {type}
                          </Badge>
                        )}
                        {isEditing ? (
                          <Text
                            field={location.locationTitle?.jsonValue}
                            tag="h3"
                            className="text-foreground text-xl font-semibold tracking-tight"
                          />
                        ) : (
                          <h3 className="text-foreground text-xl font-semibold tracking-tight">
                            <Link href={href} className="hover:underline">
                              {name}
                            </Link>
                          </h3>
                        )}
                      </div>

                      <div className="text-muted-foreground mt-auto space-y-2 text-sm">
                        {(address || isEditing) && (
                          <p className="flex items-start gap-2">
                            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                            {isEditing ? (
                              <span>
                                <Text field={location.streetAddress?.jsonValue} tag="span" />
                              </span>
                            ) : (
                              <span>{address}</span>
                            )}
                          </p>
                        )}
                        {(phone || isEditing) && (
                          <p className="flex items-start gap-2">
                            <Phone aria-hidden className="mt-0.5 size-4 shrink-0" />
                            {phone && !isEditing ? (
                              <a href={telHref(phone)} className="hover:underline">
                                <Text field={location.phoneNumber?.jsonValue} tag="span" />
                              </a>
                            ) : (
                              <Text field={location.phoneNumber?.jsonValue} tag="span" />
                            )}
                          </p>
                        )}
                      </div>

                      {!isEditing && name && (
                        <div className="flex items-center justify-between gap-3">
                          <Link href={href} className="text-primary text-sm font-medium hover:underline">
                            View location
                          </Link>
                          {mapItems.some((item) => item.id === itemId) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedId(itemId)}
                            >
                              Show on map
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : locations.length > 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No locations match this filter.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm" data-testid="location-listing-empty">
            {isLoadingRemote
              ? 'Loading locations…'
              : datasourceAssigned
                ? 'No locations found under this datasource. Add location items under Data/Locations.'
                : 'Assign the Locations folder as the datasource, then add or edit location items under Data/Locations.'}
          </p>
        )}
      </div>
    </section>
  );
};
