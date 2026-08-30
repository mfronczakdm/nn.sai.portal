'use client';

import type React from 'react';
import { useMemo } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';
import { useMatchMedia } from '@/hooks/use-match-media';
import { Default as AnimatedSection } from '@/components/animated-section/AnimatedSection.dev';
import type { LocationSearchProps } from './location-search.props';
import { FootprintGoogleMap } from './FootprintGoogleMap.dev';
import { FootprintWorldMap } from './FootprintWorldMap.dev';
import {
  FOOTPRINT_LEGEND_ITEMS,
  FOOTPRINT_PIN_COLORS,
  mapFootprintItemsToPoints,
} from './location-footprint.utils';

export const LocationSearchVersion1 = (props: LocationSearchProps) => {
  const { fields, isPageEditing } = props;
  const datasource = fields?.data?.datasource;
  const title = datasource?.title;
  const footprintItems = datasource?.children?.results ?? [];
  const prefersReducedMotion = useMatchMedia('(prefers-reduced-motion: reduce)');
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const mapPoints = useMemo(() => mapFootprintItemsToPoints(footprintItems), [footprintItems]);

  if (!fields?.data?.datasource) {
    return <NoDataFallback componentName="LocationSearchVersion1" />;
  }

  return (
    <section
      className={cn('@container bg-background text-foreground relative', {
        [props?.params?.styles]: props?.params?.styles,
      })}
      data-component="LocationSearch"
      data-variant="Version1"
    >
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:py-14">
        {googleMapsApiKey === '' && isPageEditing && (
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for the interactive globe. Showing a static world map
            until the key is available. Select component variant Version1 (not Pages layout Version
            1) and datasource “An unrivaled global footprint”.
          </p>
        )}

        {title?.jsonValue && (
          <AnimatedSection
            direction="up"
            className="relative z-20"
            isPageEditing={isPageEditing}
            reducedMotion={prefersReducedMotion}
          >
            <Text
              tag="h2"
              field={title.jsonValue}
              className="mb-8 text-center text-3xl font-semibold tracking-tight text-[#1a2b4a] md:text-4xl"
            />
          </AnimatedSection>
        )}

        <AnimatedSection
          direction="up"
          className="relative z-20"
          isPageEditing={isPageEditing}
          reducedMotion={prefersReducedMotion}
          delay={200}
        >
          <div
            className="relative mx-auto h-[420px] w-full overflow-hidden rounded-none md:h-[520px]"
          >
            {mapPoints.length > 0 && googleMapsApiKey ? (
              <FootprintGoogleMap apiKey={googleMapsApiKey} locations={mapPoints} />
            ) : mapPoints.length > 0 ? (
              <FootprintWorldMap locations={mapPoints} />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#b8d4e8] text-center text-muted-foreground">
                {isPageEditing
                  ? 'Add location children with GEO coordinates and Type to display the global footprint map.'
                  : 'No locations to display.'}
              </div>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection
          direction="up"
          className="relative z-20"
          isPageEditing={isPageEditing}
          reducedMotion={prefersReducedMotion}
          delay={400}
        >
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {FOOTPRINT_LEGEND_ITEMS.map((item) => (
              <div key={item.pinType} className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: FOOTPRINT_PIN_COLORS[item.pinType] }}
                  aria-hidden
                />
                <span className="text-sm text-gray-600 md:text-base">{item.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {isPageEditing && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footprintItems.length} location item{footprintItems.length === 1 ? '' : 's'},{' '}
            {mapPoints.length} with valid GEO on map.
          </p>
        )}
      </div>
    </section>
  );
};
