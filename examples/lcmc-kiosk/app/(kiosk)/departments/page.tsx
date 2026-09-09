import { DepartmentDirectory } from '@/components/departments/DepartmentDirectory';
import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { getDepartments } from '@/lib/sitecore/api';

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
  try {
    const departments = await getDepartments();
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-bold text-lcmc-navy">Departments and services</h1>
        <p className="mb-6 text-xl text-lcmc-muted">
          These listings come from LCMC Service items in Sitecore (there is no Departments folder).
        </p>
        <DepartmentDirectory departments={departments} />
      </div>
    );
  } catch {
    return <ContentUnavailable />;
  }
}
