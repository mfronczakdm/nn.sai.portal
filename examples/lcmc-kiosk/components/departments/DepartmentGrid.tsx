'use client';

import type { Department } from '@/lib/sitecore/types';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import { DepartmentCard } from './DepartmentCard';

export function DepartmentGrid({ departments }: { departments: Department[] }) {
  const { dictionary } = useKioskI18n();

  if (departments.length === 0) {
    return <p className="text-xl text-lcmc-ink">{dictionary.noDepartments}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {departments.map((department) => (
        <DepartmentCard key={department.id} department={department} />
      ))}
    </div>
  );
}
