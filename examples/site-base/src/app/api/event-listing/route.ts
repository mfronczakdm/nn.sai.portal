import { NextResponse } from 'next/server';

import { fetchEventListingChildren } from '@/lib/event-listing-from-edge';
import { toEdgeItemPath } from '@/lib/location-footprint-from-edge';

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
  const rootPath = toEdgeItemPath(rawRoot);
  const datasourcePath = toEdgeItemPath(rawDatasource);

  if ((rootPath && !isAllowedPath(rootPath)) || (datasourcePath && !isAllowedPath(datasourcePath))) {
    return NextResponse.json({ events: [] }, { status: 400 });
  }

  if (!rootPath && !datasourcePath) {
    return NextResponse.json({ events: [] }, { status: 400 });
  }

  const events = await fetchEventListingChildren({
    rootPath,
    datasourcePath,
    language,
  });
  return NextResponse.json({ events });
}
