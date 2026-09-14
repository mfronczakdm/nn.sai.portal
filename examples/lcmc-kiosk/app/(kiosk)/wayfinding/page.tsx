import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { WayfindingDirectory } from '@/components/wayfinding/WayfindingDirectory';
import { getRequestI18n } from '@/lib/i18n/get-locale';
import { getLocations } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

export default async function WayfindingPage() {
  const { dictionary } = getRequestI18n();

  try {
    const locations = await getLocations();

    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-lcmc-navy">{dictionary.wayfindingTitle}</h1>
        <p className="mt-3 text-xl text-lcmc-ink">{dictionary.wayfindingIntro}</p>
        <div className="mt-8 rounded-3xl border-4 border-dashed border-lcmc-teal bg-white p-10 text-center text-xl text-lcmc-muted">
          {dictionary.campusMapPlaceholder}
        </div>
        <div className="mt-8">
          <WayfindingDirectory locations={locations} />
        </div>
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
