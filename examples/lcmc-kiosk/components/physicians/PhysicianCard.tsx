'use client';

import Link from 'next/link';
import type { Physician } from '@/lib/sitecore/types';
import { physicianDisplayName } from '@/lib/utils';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import { PhysicianAvatar } from './PhysicianAvatar';

export function PhysicianCard({ physician }: { physician: Physician }) {
  const { dictionary } = useKioskI18n();
  const location = physician.locations[0]?.shortName;

  return (
    <Link
      href={`/physicians/${physician.slug}`}
      className="flex min-h-[12rem] items-center gap-5 rounded-3xl border-2 border-slate-200 bg-white p-5 text-left hover:border-lcmc-teal focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lcmc-teal"
    >
      <PhysicianAvatar physician={physician} />
      <div>
        <h2 className="text-2xl font-bold text-lcmc-navy">
          {physicianDisplayName(physician.name, physician.credentials)}
        </h2>
        <p className="mt-1 text-lg text-lcmc-ink">{physician.specialty || dictionary.specialtyNotListed}</p>
        {location ? <p className="mt-1 text-base text-lcmc-muted">{location}</p> : null}
      </div>
    </Link>
  );
}
