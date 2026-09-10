'use client';

import { useMemo, useState } from 'react';
import { KioskSearch } from '@/components/kiosk/KioskSearch';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import type { Department } from '@/lib/sitecore/types';
import { matchesSearch } from '@/lib/utils';
import { DepartmentGrid } from './DepartmentGrid';

export function DepartmentDirectory({ departments }: { departments: Department[] }) {
  const { dictionary } = useKioskI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return departments.filter((department) =>
      matchesSearch(
        [
          department.name,
          department.shortDescription,
          ...department.locations.map((location) => `${location.name} ${location.shortName} ${location.city}`),
        ].join(' '),
        query
      )
    );
  }, [departments, query]);

  return (
    <KioskSearch
      label={dictionary.departmentSearchLabel}
      placeholder={dictionary.departmentSearchPlaceholder}
      query={query}
      onQueryChange={setQuery}
      resultSummary={dictionary.departmentResults(filtered.length)}
    >
      <DepartmentGrid departments={filtered} />
    </KioskSearch>
  );
}
