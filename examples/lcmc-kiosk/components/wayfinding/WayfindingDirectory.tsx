'use client';

import { useMemo, useState } from 'react';
import { KioskSearch } from '@/components/kiosk/KioskSearch';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import type { LocationSummary } from '@/lib/sitecore/types';
import { matchesSearch } from '@/lib/utils';
import { FindMyWayButton } from '@/components/wayfinding/FindMyWayButton';

export function WayfindingDirectory({ locations }: { locations: LocationSummary[] }) {
  const { dictionary } = useKioskI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return locations.filter((location) =>
      matchesSearch(
        [
          location.name,
          location.shortName,
          location.address,
          location.city,
          location.locationType,
          location.hours,
          location.parking,
        ].join(' '),
        query
      )
    );
  }, [locations, query]);

  return (
    <KioskSearch
      label={dictionary.locationSearchLabel}
      placeholder={dictionary.locationSearchPlaceholder}
      query={query}
      onQueryChange={setQuery}
      resultSummary={dictionary.locationResults(filtered.length)}
    >
      {filtered.length === 0 ? (
        <p className="text-xl text-lcmc-ink">{dictionary.noLocations}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((location) => (
            <li key={location.id} className="rounded-3xl bg-white p-6 text-lg">
              <h2 className="text-2xl font-bold text-lcmc-navy">{location.name}</h2>
              {location.locationType ? (
                <p className="mt-1 text-base font-medium text-lcmc-teal">{location.locationType}</p>
              ) : null}
              <p className="mt-2">{location.address}</p>
              <p className="mt-1 text-lcmc-muted">{location.hours}</p>
              {location.parking ? <p className="mt-3">{location.parking}</p> : null}
              {location.visitorInfoHtml ? (
                <div className="mt-3" dangerouslySetInnerHTML={{ __html: location.visitorInfoHtml }} />
              ) : null}
              <div className="mt-4">
                <FindMyWayButton
                  destinationName={location.shortName || location.name}
                  buildingName={location.name}
                  address={location.address}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </KioskSearch>
  );
}
