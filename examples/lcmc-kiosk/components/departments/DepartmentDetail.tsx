import { PhysicianGrid } from '@/components/physicians/PhysicianGrid';
import type { Department } from '@/lib/sitecore/types';

export function DepartmentDetail({ department }: { department: Department }) {
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
        <h2 className="text-2xl font-bold text-lcmc-navy">Where to go</h2>
        <p className="mt-2 text-lg text-lcmc-muted">
          Map placeholder — campus maps can be added when facilities provides floor plans.
        </p>
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
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-lcmc-navy">Physicians in this service</h2>
        <div className="mt-4">
          <PhysicianGrid physicians={department.physicians} />
        </div>
      </section>
    </article>
  );
}
