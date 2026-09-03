import { NextResponse } from 'next/server';

import {
  fetchEventListingChildren,
  type EventListingEdgeMode,
} from '@/lib/event-listing-from-edge';
import { toEventListingItemPath } from '@/lib/event-listing-model';

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
  const edgeMode: EventListingEdgeMode =
    previewParam === '1' || previewParam === 'true' ? 'preview' : 'live';
  const rootPath = toEventListingItemPath(rawRoot);
  const datasourcePath = toEventListingItemPath(rawDatasource);

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
    edgeMode,
  });
  return NextResponse.json(
    { events },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
