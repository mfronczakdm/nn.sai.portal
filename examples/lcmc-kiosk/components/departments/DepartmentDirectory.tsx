'use client';

import { useMemo, useState } from 'react';
import { OnScreenKeyboard } from '@/components/kiosk/OnScreenKeyboard';
import type { Department } from '@/lib/sitecore/types';
import { DepartmentGrid } from './DepartmentGrid';

export function DepartmentDirectory({ departments }: { departments: Department[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return departments;
    return departments.filter((department) =>
      [department.name, department.shortDescription, ...department.locations.map((location) => location.name)]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [departments, query]);

  return (
    <div className="flex flex-col gap-6">
      <label className="block">
        <span className="mb-2 block text-lg font-semibold text-lcmc-navy">Search departments and services</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-tap w-full rounded-2xl border-2 border-lcmc-navy px-5 text-2xl"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <OnScreenKeyboard value={query} onChange={setQuery} />
      <DepartmentGrid departments={filtered} />
    </div>
  );
}
