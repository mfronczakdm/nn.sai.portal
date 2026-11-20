import { NextResponse } from 'next/server';

import { toServiceListingItemPath } from '@/components/uiim/services/service-listing.model';
import { fetchServiceListingPages, type ServiceListingEdgeMode } from '@/lib/service-listing-from-edge';

export const dynamic = 'force-dynamic';

function isAllowedPath(path: string): boolean {
  if (path.startsWith('/sitecore/content/')) return true;
  const guid = path.replace(/[{}]/g, '');
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid);
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rawRoot = searchParams.get('root')?.trim() ?? '';
  const rawDatasource = searchParams.get('datasource')?.trim() ?? '';
  const language = searchParams.get('language')?.trim() || 'en';
  const previewParam = (searchParams.get('preview') || '').trim().toLowerCase();
  const edgeMode: ServiceListingEdgeMode =
    previewParam === '1' || previewParam === 'true' ? 'preview' : 'live';
  const rootPath = toServiceListingItemPath(rawRoot);
  const datasourcePath = toServiceListingItemPath(rawDatasource);

  if ((rootPath && !isAllowedPath(rootPath)) || (datasourcePath && !isAllowedPath(datasourcePath))) {
    return NextResponse.json({ services: [] }, { status: 400 });
  }

  if (!rootPath && !datasourcePath) {
    return NextResponse.json({ services: [] }, { status: 400 });
  }

  const services = await fetchServiceListingPages({
    rootPath,
    datasourcePath,
    language,
    edgeMode,
  });

  return NextResponse.json({ services }, { headers: { 'Cache-Control': 'no-store' } });
}
