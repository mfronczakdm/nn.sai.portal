import type { Physician } from '@/lib/sitecore/types';
import { PhysicianCard } from './PhysicianCard';

export function PhysicianGrid({ physicians }: { physicians: Physician[] }) {
  if (physicians.length === 0) {
    return <p className="text-xl text-lcmc-ink">No physicians match those filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {physicians.map((physician) => (
        <PhysicianCard key={physician.id} physician={physician} />
      ))}
    </div>
  );
}
