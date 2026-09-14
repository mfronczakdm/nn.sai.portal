import { Skeleton } from '@/components/ui/Skeleton';

export default function PhysicianDetailLoading() {
  return (
    <div className="mx-auto flex max-w-5xl gap-8">
      <Skeleton className="h-40 w-40 rounded-full" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
