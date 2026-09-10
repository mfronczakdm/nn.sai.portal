'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { KioskSearch } from '@/components/kiosk/KioskSearch';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import type { Physician } from '@/lib/sitecore/types';
import { matchesSearch } from '@/lib/utils';
import { PhysicianGrid } from './PhysicianGrid';

type PhysicianDirectoryProps = {
  physicians: Physician[];
};

export function PhysicianDirectory({ physicians }: PhysicianDirectoryProps) {
  const { dictionary } = useKioskI18n();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');

  const specialties = useMemo(() => {
    const values = new Set(physicians.map((physician) => physician.specialty).filter(Boolean));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [physicians]);

  const filtered = useMemo(() => {
    return physicians.filter((physician) => {
      const matchesSpecialty = specialty === 'all' || physician.specialty === specialty;
      if (!matchesSpecialty) return false;
      return matchesSearch(
        [
          physician.name,
          physician.credentials,
          physician.specialty,
          physician.departmentName ?? '',
          ...physician.locations.map((location) => `${location.name} ${location.shortName} ${location.city}`),
        ].join(' '),
        query
      );
    });
  }, [physicians, query, specialty]);

  return (
    <KioskSearch
      label={dictionary.physicianSearchLabel}
      placeholder={dictionary.physicianSearchPlaceholder}
      query={query}
      onQueryChange={setQuery}
      resultSummary={dictionary.physicianResults(filtered.length)}
    >
      <div className="mb-4 flex flex-wrap gap-3" role="group" aria-label={dictionary.filterBySpecialty}>
        {specialties.map((value) => (
          <Button
            key={value}
            variant={specialty === value ? 'primary' : 'secondary'}
            onClick={() => setSpecialty(value)}
          >
            {value === 'all' ? dictionary.allSpecialties : value}
          </Button>
        ))}
      </div>
      <PhysicianGrid physicians={filtered} />
    </KioskSearch>
  );
}
