import type { Department } from '@/lib/sitecore/types';
import { DepartmentCard } from './DepartmentCard';

export function DepartmentGrid({ departments }: { departments: Department[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {departments.map((department) => (
        <DepartmentCard key={department.id} department={department} />
      ))}
    </div>
  );
}
