'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RichText as ContentSdkRichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ArrowRight, Search, Stethoscope, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import {
  collectServices,
  extractServicesRootId,
  fieldString,
  filterServices,
  servicesMatchingQuery,
  serviceTypeOptions,
  toServiceListingItemPath,
} from './service-listing.model';
import type {
  ResolvedService,
  ServiceListingPageNode,
  ServiceListingProps,
} from './service-listing.props';

function isChecked(field?: { jsonValue?: { value?: unknown } } | null): boolean {
  if (!field?.jsonValue) return true;
  const value = field.jsonValue.value;
  if (value === false || value === '0' || value === '') return false;
  return value === true || value === '1' || value === 'true';
}

function shortTitleIsDistinct(service: ResolvedService): boolean {
  if (!service.shortTitle) return false;
  const shortTitle = service.shortTitle.toLowerCase();
  return shortTitle !== service.title.toLowerCase() && shortTitle !== service.serviceType.toLowerCase();
}

const ServiceListingEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="border-border bg-muted/30 text-muted-foreground rounded-2xl border border-dashed px-6 py-16 text-center">
    <Stethoscope className="mx-auto mb-3 size-8 opacity-40" aria-hidden />
    <p className="text-sm">{message}</p>
  </div>
);

function ServiceCard({
  service,
  onSelectType,
}: {
  service: ResolvedService;
  onSelectType: (type: string) => void;
}) {
  const showShortTitle = shortTitleIsDistinct(service);
  const body = (
    <>
      <h3 className="font-heading text-foreground group-hover:text-primary text-xl leading-snug font-semibold tracking-tight">
        {service.title}
      </h3>
      {showShortTitle ? (
        <p className="text-primary mt-1 text-sm font-medium">{service.shortTitle}</p>
      ) : null}
      {service.summary ? (
        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-relaxed">{service.summary}</p>
      ) : null}
      <span className="text-primary mt-5 inline-flex items-center gap-1 text-sm font-medium">
        View service
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </>
  );

  return (
    <li className="border-border bg-card flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onSelectType(service.serviceType)}
          className="bg-primary/10 text-primary hover:bg-primary/15 focus-visible:ring-ring rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide focus-visible:ring-2 focus-visible:outline-none"
        >
          {service.serviceType}
        </button>
      </div>
      {service.href === '#' ? (
        <div className="flex flex-1 flex-col">{body}</div>
      ) : (
        <Link href={service.href} className="group flex flex-1 flex-col no-underline">
          {body}
        </Link>
      )}
    </li>
  );
}

export const Default: React.FC<ServiceListingProps> = (props) => {
  const { fields, params, rendering, isPageEditing: propEditing } = props;
  const { page } = useSitecore();
  const isEditing = propEditing ?? Boolean(page?.mode?.isEditing);
  const datasource = fields?.data?.datasource;

  const inlineServices = useMemo(
    () => collectServices(datasource?.servicesRoot?.targetItem?.children?.results),
    [datasource?.servicesRoot?.targetItem?.children?.results]
  );

  const [remoteServices, setRemoteServices] = useState<ServiceListingPageNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const rootId = extractServicesRootId(datasource?.servicesRoot);
  const datasourceId = rendering?.dataSource?.trim() ?? '';
  const language =
    (page?.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';

  useEffect(() => {
    if (inlineServices.length > 0) return;
    const rootRef = toServiceListingItemPath(rootId);
    const dsRef = toServiceListingItemPath(datasourceId);
    if (!rootRef && !dsRef) return;

    const controller = new AbortController();
    const search = new URLSearchParams({ language });
    if (rootRef) search.set('root', rootRef);
    if (dsRef) search.set('datasource', dsRef);
    if (isEditing) search.set('preview', '1');

    setIsLoading(true);
    fetch(`/api/service-listing?${search.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) return { services: [] as ServiceListingPageNode[] };
        return response.json() as Promise<{ services?: ServiceListingPageNode[] }>;
      })
      .then((payload) => {
        setRemoteServices(payload?.services ?? []);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== 'AbortError') {
          console.error('[ServiceListing] failed to load services', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [inlineServices.length, rootId, datasourceId, language, isEditing]);

  const services = useMemo(
    () => (inlineServices.length > 0 ? inlineServices : collectServices(remoteServices)),
    [inlineServices, remoteServices]
  );
  const searched = useMemo(() => servicesMatchingQuery(services, query), [services, query]);
  const typeOptions = useMemo(() => serviceTypeOptions(searched), [searched]);
  const filtered = useMemo(
    () => filterServices(services, query, selectedTypes),
    [services, query, selectedTypes]
  );

  if (!datasource) {
    return <NoDataFallback componentName="ServiceListing" />;
  }

  const showFilters = isChecked(datasource.showFilters) || isEditing;
  const emptyText = fieldString(datasource.emptyResultsText) || 'No services match your search.';
  const facetLabel = fieldString(datasource.filterFacetLabel) || 'Service type';
  const searchPlaceholder =
    fieldString(datasource.searchPlaceholder) || 'Search by service name or keyword';
  const sectionId = params?.RenderingIdentifier || 'service-listing';
  const hasActiveFilters = query.trim() !== '' || selectedTypes.length > 0;

  const toggleType = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  const selectOnlyType = (type: string) => {
    setSelectedTypes((current) => (current.length === 1 && current[0] === type ? [] : [type]));
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedTypes([]);
  };

  return (
    <section
      id={sectionId}
      data-component="ServiceListing"
      data-variant="Default"
      className={cn('@container bg-background text-foreground', params?.styles)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-3xl">
          {(fieldString(datasource.title) || isEditing) && (
            <Text
              tag="h2"
              field={datasource.title?.jsonValue}
              className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
            />
          )}
          {(datasource.intro?.jsonValue?.value || isEditing) && (
            <div className="text-muted-foreground mt-4 text-pretty text-base leading-relaxed sm:text-lg">
              <ContentSdkRichText field={datasource.intro?.jsonValue} />
            </div>
          )}
        </header>

        {showFilters && (
          <div className="border-border bg-muted/20 mb-8 rounded-2xl border p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search services</span>
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="bg-background h-11 pl-9"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                disabled={!hasActiveFilters}
                onClick={clearFilters}
              >
                <X className="size-4" aria-hidden />
                Clear
              </Button>
            </div>

            {typeOptions.length > 0 && (
              <div className="mt-4 border-t border-border/60 pt-4">
                <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                  {facetLabel}
                </p>
                <div role="group" aria-label={facetLabel} className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={selectedTypes.length === 0}
                    onClick={() => setSelectedTypes([])}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      selectedTypes.length === 0
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:border-primary/40'
                    )}
                  >
                    All
                    <span className="ml-1 opacity-80">{searched.length}</span>
                  </button>
                  {typeOptions.map((option) => {
                    const active = selectedTypes.includes(option.type);
                    return (
                      <button
                        key={option.type}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleType(option.type)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                        {option.type}
                        <span className="ml-1 opacity-80">{option.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-muted-foreground mt-3 text-sm" aria-live="polite">
              Showing {filtered.length} of {services.length} services
              {selectedTypes.length > 0 ? ` in ${selectedTypes.join(', ')}` : ''}
            </p>
          </div>
        )}

        {isLoading && services.length === 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="bg-muted/50 h-48 animate-pulse rounded-2xl" />
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <ServiceListingEmpty
            message={
              isEditing && services.length === 0
                ? 'Select a Services Root page. Service cards load from that page and its child services.'
                : emptyText
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard key={service.key} service={service} onSelectType={selectOnlyType} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
