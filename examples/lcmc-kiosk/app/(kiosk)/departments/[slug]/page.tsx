import { notFound } from 'next/navigation';
import { DepartmentDetail } from '@/components/departments/DepartmentDetail';
import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { getDepartmentBySlug } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

type DepartmentDetailPageProps = {
  params: { slug: string };
};

export default async function DepartmentDetailPage({ params }: DepartmentDetailPageProps) {
  try {
    const department = await getDepartmentBySlug(params.slug);
    if (!department) notFound();
    return (
      <div className="mx-auto max-w-6xl">
        <DepartmentDetail department={department} />
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
