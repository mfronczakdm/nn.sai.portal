'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import type { Physician } from '@/lib/sitecore/types';
import { physicianDisplayName } from '@/lib/utils';
import { PhysicianAvatar } from './PhysicianAvatar';
import { FindMyWayButton } from '@/components/wayfinding/FindMyWayButton';

export function PhysicianDetail({ physician }: { physician: Physician }) {
  const { dictionary } = useKioskI18n();

  return (
    <article className="grid gap-8 lg:grid-cols-[auto_1fr]">
      <PhysicianAvatar physician={physician} size="lg" />
      <div>
        <h1 className="text-4xl font-bold text-lcmc-navy">
          {physicianDisplayName(physician.name, physician.credentials)}
        </h1>
        <p className="mt-2 text-2xl text-lcmc-ink">{physician.specialty}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {physician.departmentName ? <Badge tone="info">{physician.departmentName}</Badge> : null}
          {physician.acceptingNewPatients === true ? (
            <Badge tone="success">{dictionary.acceptingNewPatients}</Badge>
          ) : null}
          {physician.acceptingNewPatients === false ? (
            <Badge>{dictionary.notAcceptingNewPatients}</Badge>
          ) : null}
        </div>

        <div className="mt-6">
          <FindMyWayButton
            destinationName={physician.name}
            buildingName={physician.locations[0]?.shortName || physician.locations[0]?.name}
            address={physician.locations[0]?.address}
            className="min-w-[16rem] bg-lcmc-green hover:bg-lcmc-green"
          />
        </div>

        {physician.bioHtml ? (
          <div
            className="mt-6 space-y-3 text-xl leading-relaxed text-lcmc-ink"
            dangerouslySetInnerHTML={{ __html: physician.bioHtml }}
          />
        ) : (
          <p className="mt-6 text-xl text-lcmc-muted">{dictionary.noBiography}</p>
        )}

        {physician.phone ? (
          <p className="mt-6 text-xl">
            <span className="font-semibold">{dictionary.phone}: </span>
            {physician.phone}
          </p>
        ) : null}

        {physician.languagesSpoken.length > 0 ? (
          <p className="mt-3 text-xl">
            <span className="font-semibold">{dictionary.languages}: </span>
            {physician.languagesSpoken.join(', ')}
          </p>
        ) : null}

        {physician.locations.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-lcmc-navy">{dictionary.whereToFindPhysician}</h2>
            <ul className="mt-3 space-y-3">
              {physician.locations.map((location) => (
                <li key={location.id} className="rounded-2xl bg-white p-4 text-lg">
                  <p className="font-semibold">{location.name}</p>
                  <p>{location.address}</p>
                  {location.hours ? <p className="text-lcmc-muted">{location.hours}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {physician.departmentSlug ? (
          <Link
            href={`/departments/${physician.departmentSlug}`}
            className="kiosk-tap mt-8 bg-lcmc-navy text-white"
          >
            {dictionary.viewDepartment}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
