import Link from 'next/link';
import type { Department } from '@/lib/sitecore/types';

export function DepartmentCard({ department }: { department: Department }) {
  const primaryLocation = department.locations[0];

  return (
    <Link
      href={`/departments/${department.slug}`}
      className="flex min-h-[12rem] flex-col justify-center rounded-3xl border-2 border-slate-200 bg-white p-6 text-left hover:border-lcmc-teal focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lcmc-teal"
    >
      <h2 className="text-2xl font-bold text-lcmc-navy">{department.name}</h2>
      <p className="mt-2 text-lg text-lcmc-ink">{department.shortDescription}</p>
      {primaryLocation ? (
        <p className="mt-3 text-base text-lcmc-muted">
          {primaryLocation.shortName}
          {department.locations.length > 1 ? ` + ${department.locations.length - 1} more` : ''}
        </p>
      ) : null}
    </Link>
  );
}
