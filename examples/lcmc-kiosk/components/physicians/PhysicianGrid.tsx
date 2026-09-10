'use client';

import type { Physician } from '@/lib/sitecore/types';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import { PhysicianCard } from './PhysicianCard';

export function PhysicianGrid({ physicians }: { physicians: Physician[] }) {
  const { dictionary } = useKioskI18n();

  if (physicians.length === 0) {
    return <p className="text-xl text-lcmc-ink">{dictionary.noPhysicians}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {physicians.map((physician) => (
        <PhysicianCard key={physician.id} physician={physician} />
      ))}
    </div>
  );
}
