import { DirectorySkeleton } from '@/components/ui/Skeleton';

export default function DepartmentsLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-4xl font-bold text-lcmc-navy">Departments and services</h1>
      <DirectorySkeleton />
    </div>
  );
}
