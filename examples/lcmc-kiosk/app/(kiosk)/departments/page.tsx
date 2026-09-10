import { DepartmentDirectory } from '@/components/departments/DepartmentDirectory';
import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { getRequestI18n } from '@/lib/i18n/get-locale';
import { getDepartments } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
  const { dictionary } = getRequestI18n();

  try {
    const departments = await getDepartments();
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-bold text-lcmc-navy">{dictionary.departmentsTitle}</h1>
        <p className="mb-6 text-xl text-lcmc-muted">{dictionary.departmentsIntro}</p>
        <DepartmentDirectory departments={departments} />
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
