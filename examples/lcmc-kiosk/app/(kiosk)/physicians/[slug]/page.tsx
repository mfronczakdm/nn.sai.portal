import { notFound } from 'next/navigation';
import { PhysicianDetail } from '@/components/physicians/PhysicianDetail';
import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { getPhysicianBySlug } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

type PhysicianDetailPageProps = {
  params: { slug: string };
};

export default async function PhysicianDetailPage({ params }: PhysicianDetailPageProps) {
  try {
    const physician = await getPhysicianBySlug(params.slug);
    if (!physician) notFound();
    return (
      <div className="mx-auto max-w-5xl">
        <PhysicianDetail physician={physician} />
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
