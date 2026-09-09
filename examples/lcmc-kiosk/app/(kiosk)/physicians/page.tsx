import { PhysicianDirectory } from '@/components/physicians/PhysicianDirectory';
import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { getPhysicians } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

export default async function PhysiciansPage() {
  try {
    const physicians = await getPhysicians();
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold text-lcmc-navy">Find a doctor</h1>
        <PhysicianDirectory physicians={physicians} />
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
