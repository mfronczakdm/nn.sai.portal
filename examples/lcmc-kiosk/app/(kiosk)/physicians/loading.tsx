import { DirectorySkeleton } from '@/components/ui/Skeleton';
import { getRequestI18n } from '@/lib/i18n/get-locale';

export default function PhysiciansLoading() {
  const { dictionary } = getRequestI18n();

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-4xl font-bold text-lcmc-navy">{dictionary.physiciansTitle}</h1>
      <DirectorySkeleton />
    </div>
  );
}
