'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';
import { useMatchMedia } from '@/hooks/use-match-media';
import { Default as AnimatedSection } from '@/components/animated-section/AnimatedSection.dev';
import type { FootprintLocationFields, LocationSearchProps } from './location-search.props';
import { FootprintGlobalMap } from './FootprintGlobalMap.dev';
import {
  FOOTPRINT_LEGEND_ITEMS,
  FOOTPRINT_PIN_COLORS,
  mapFootprintItemsToPoints,
  type FootprintPinType,
} from './location-footprint.utils';

const LegendPin = ({ pinType }: { pinType: FootprintPinType }) => (
  <svg viewBox="0 0 18 26" className="h-6 w-4 shrink-0" aria-hidden>
    <path
      d="M9 25.5C6.3 21.5 1.5 15.1 1.5 10.2A7.5 7.5 0 0 1 16.5 10.2C16.5 15.1 11.7 21.5 9 25.5z"
      fill={FOOTPRINT_PIN_COLORS[pinType]}
    />
    <circle cx="9" cy="10" r="2.7" fill="#ffffff" />
  </svg>
);

/**
 * World-view global footprint: full-bleed Mercator world map with typed location pins.
 * No Google Maps dependency — land outlines and pins are rendered as SVG.
 */
export const LocationSearchVersion2 = (props: LocationSearchProps) => {
  const { fields, isPageEditing, rendering, page } = props;
  const datasource = fields?.data?.datasource;
  const title = datasource?.title;
  const inlineItems = datasource?.children?.results ?? [];
  const prefersReducedMotion = useMatchMedia('(prefers-reduced-motion: reduce)');
  const [locations, setLocations] = useState<FootprintLocationFields[]>(inlineItems);

  const datasourceId = rendering?.dataSource ?? '';
  const language =
    (page?.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';

  // The layout ComponentQuery can only return the first page of children, so the
  // complete location list is loaded from the Content API.
  useEffect(() => {
    if (!datasourceId) return;

    const controller = new AbortController();
    fetch(
      `/api/location-footprint?datasource=${encodeURIComponent(datasourceId)}&language=${encodeURIComponent(language)}`,
      { signal: controller.signal }
    )
      .then((response) => (response.ok ? response.json() : { locations: [] }))
      .then((payload: { locations?: FootprintLocationFields[] }) => {
        if (payload?.locations?.length) setLocations(payload.locations);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== 'AbortError') {
          console.error('[LocationSearchVersion2] failed to load locations', error);
        }
      });

    return () => controller.abort();
  }, [datasourceId, language]);

  const footprintItems = locations.length ? locations : inlineItems;
  const mapPoints = useMemo(() => mapFootprintItemsToPoints(footprintItems), [footprintItems]);

  if (!datasource) {
    return <NoDataFallback componentName="LocationSearchVersion2" />;
  }

  return (
    <section
      className={cn('@container bg-white text-foreground', {
        [props?.params?.styles]: props?.params?.styles,
      })}
      data-component="LocationSearch"
      data-variant="Version2"
    >
      {title?.jsonValue && (
        <AnimatedSection
          direction="up"
          isPageEditing={isPageEditing}
          reducedMotion={prefersReducedMotion}
        >
          <Text
            tag="h2"
            field={title.jsonValue}
            className="mx-auto max-w-4xl px-4 py-8 text-center text-3xl font-normal tracking-tight text-[#1f5c86] md:py-10 md:text-[2.5rem]"
          />
        </AnimatedSection>
      )}

      <AnimatedSection
        direction="up"
        isPageEditing={isPageEditing}
        reducedMotion={prefersReducedMotion}
        delay={200}
      >
        <div className="relative h-[320px] w-full @md:h-[420px] @2xl:h-[520px]">
          {mapPoints.length > 0 ? (
            <FootprintGlobalMap locations={mapPoints} />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#c9dceb] px-6 text-center text-sm text-gray-600">
              {isPageEditing
                ? 'Add location child items with GEO coordinates and Type to display the global footprint map.'
                : 'No locations to display.'}
            </div>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection
        direction="up"
        isPageEditing={isPageEditing}
        reducedMotion={prefersReducedMotion}
        delay={400}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 md:py-8">
          {FOOTPRINT_LEGEND_ITEMS.map((item) => (
            <div key={item.pinType} className="flex items-center gap-2">
              <LegendPin pinType={item.pinType} />
              <span className="text-sm text-gray-500 md:text-base">{item.label}</span>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {isPageEditing && (
        <p className="pb-6 text-center text-sm text-muted-foreground">
          {footprintItems.length} location item{footprintItems.length === 1 ? '' : 's'},{' '}
          {mapPoints.length} with valid GEO on map.
        </p>
      )}
    </section>
  );
};
