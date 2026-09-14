import { Skeleton } from '@/components/ui/Skeleton';

export default function DepartmentDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
