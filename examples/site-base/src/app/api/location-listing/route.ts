import { NextResponse } from 'next/server';

import {
  fetchLocationListingChildren,
  toLocationListingItemPath,
  type LocationListingEdgeMode,
} from '@/lib/location-listing-from-edge';

export const dynamic = 'force-dynamic';

function isAllowedPath(path: string): boolean {
  if (path.startsWith('/sitecore/content/')) return true;
  const guid = path.replace(/[{}]/g, '');
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid);
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rawDatasource = searchParams.get('datasource')?.trim() ?? '';
  const language = searchParams.get('language')?.trim() || 'en';
  const previewParam = (searchParams.get('preview') || '').trim().toLowerCase();
  const edgeMode: LocationListingEdgeMode =
    previewParam === '1' || previewParam === 'true' ? 'preview' : 'live';
  const path = toLocationListingItemPath(rawDatasource);

  if (!path || !isAllowedPath(path)) {
    return NextResponse.json({ locations: [] }, { status: 400 });
  }

  const locations = await fetchLocationListingChildren({
    path,
    language,
    edgeMode,
  });
  return NextResponse.json({ locations }, { headers: { 'Cache-Control': 'no-store' } });
}
