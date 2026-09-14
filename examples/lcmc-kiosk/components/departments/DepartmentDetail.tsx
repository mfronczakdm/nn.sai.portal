'use client';

import { PhysicianGrid } from '@/components/physicians/PhysicianGrid';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import { FindMyWayButton } from '@/components/wayfinding/FindMyWayButton';
import type { Department } from '@/lib/sitecore/types';

export function DepartmentDetail({ department }: { department: Department }) {
  const { dictionary } = useKioskI18n();

  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-lcmc-navy">{department.name}</h1>
        {department.shortDescription ? (
          <p className="mt-3 text-2xl text-lcmc-ink">{department.shortDescription}</p>
        ) : null}
        {department.floor || department.wing ? (
          <p className="mt-2 text-xl text-lcmc-muted">
            {[department.floor, department.wing].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </header>

      {department.descriptionHtml ? (
        <div
          className="space-y-3 text-xl leading-relaxed text-lcmc-ink"
          dangerouslySetInnerHTML={{ __html: department.descriptionHtml }}
        />
      ) : null}

      <section>
        <h2 className="text-2xl font-bold text-lcmc-navy">{dictionary.whereToGo}</h2>
        <p className="mt-2 text-lg text-lcmc-muted">{dictionary.mapPlaceholder}</p>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {department.locations.map((location) => (
            <li key={location.id} className="rounded-2xl bg-white p-5 text-lg">
              <p className="text-xl font-semibold text-lcmc-navy">{location.name}</p>
              <p>{location.address}</p>
              {location.hours ? <p className="mt-1 text-lcmc-muted">{location.hours}</p> : null}
              {location.parking ? <p className="mt-2">{location.parking}</p> : null}
              {location.visitorInfoHtml ? (
                <div
                  className="mt-2 text-lcmc-ink"
                  dangerouslySetInnerHTML={{ __html: location.visitorInfoHtml }}
                />
              ) : null}
              <div className="mt-4">
                <FindMyWayButton
                  destinationName={department.name}
                  buildingName={location.shortName || location.name}
                  address={location.address}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-lcmc-navy">{dictionary.physiciansInService}</h2>
        <div className="mt-4">
          <PhysicianGrid physicians={department.physicians} />
        </div>
      </section>
    </article>
  );
}
