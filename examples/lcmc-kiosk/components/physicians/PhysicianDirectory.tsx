'use client';

import { useMemo, useState } from 'react';
import { OnScreenKeyboard } from '@/components/kiosk/OnScreenKeyboard';
import { Button } from '@/components/ui/Button';
import type { Physician } from '@/lib/sitecore/types';
import { PhysicianGrid } from './PhysicianGrid';

type PhysicianDirectoryProps = {
  physicians: Physician[];
};

export function PhysicianDirectory({ physicians }: PhysicianDirectoryProps) {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [showKeyboard, setShowKeyboard] = useState(true);

  const specialties = useMemo(() => {
    const values = new Set(physicians.map((physician) => physician.specialty).filter(Boolean));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [physicians]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return physicians.filter((physician) => {
      const matchesSpecialty = specialty === 'all' || physician.specialty === specialty;
      if (!matchesSpecialty) return false;
      if (!needle) return true;
      const haystack = [
        physician.name,
        physician.credentials,
        physician.specialty,
        physician.departmentName ?? '',
        ...physician.locations.map((location) => location.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [physicians, query, specialty]);

  return (
    <div className="flex flex-col gap-6">
      <label className="block">
        <span className="mb-2 block text-lg font-semibold text-lcmc-navy">Search by name, specialty, or location</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setShowKeyboard(true)}
          className="min-h-tap w-full rounded-2xl border-2 border-lcmc-navy px-5 text-2xl"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>

      {showKeyboard ? (
        <OnScreenKeyboard value={query} onChange={setQuery} />
      ) : (
        <Button variant="secondary" onClick={() => setShowKeyboard(true)}>
          Show on-screen keyboard
        </Button>
      )}

      <div className="flex flex-wrap gap-3" role="group" aria-label="Filter by specialty">
        {specialties.map((value) => (
          <Button
            key={value}
            variant={specialty === value ? 'primary' : 'secondary'}
            onClick={() => setSpecialty(value)}
          >
            {value === 'all' ? 'All specialties' : value}
          </Button>
        ))}
      </div>

      <PhysicianGrid physicians={filtered} />
    </div>
  );
}
