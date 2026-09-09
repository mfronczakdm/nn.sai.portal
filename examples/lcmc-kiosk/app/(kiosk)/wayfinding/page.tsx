import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { getLocations } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

export default async function WayfindingPage() {
  try {
    const locations = await getLocations();
    const hospitals = locations.filter((location) => location.locationType === 'Hospital');

    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-lcmc-navy">How to get around</h1>
        <p className="mt-3 text-xl text-lcmc-ink">
          Start at the information desk in the main lobby. For a specific clinic or service, use Find a
          Department.
        </p>
        <div className="mt-8 rounded-3xl border-4 border-dashed border-lcmc-teal bg-white p-10 text-center text-xl text-lcmc-muted">
          Campus map placeholder
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {hospitals.map((location) => (
            <li key={location.id} className="rounded-3xl bg-white p-6 text-lg">
              <h2 className="text-2xl font-bold text-lcmc-navy">{location.name}</h2>
              <p className="mt-2">{location.address}</p>
              <p className="mt-1 text-lcmc-muted">{location.hours}</p>
              {location.parking ? <p className="mt-3">{location.parking}</p> : null}
              {location.visitorInfoHtml ? (
                <div
                  className="mt-3"
                  dangerouslySetInnerHTML={{ __html: location.visitorInfoHtml }}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
