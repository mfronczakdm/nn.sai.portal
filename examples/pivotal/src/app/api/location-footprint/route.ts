import { NextResponse } from 'next/server';

import { fetchFootprintLocations, toEdgeItemPath } from '@/lib/location-footprint-from-edge';

function isAllowedDatasource(path: string): boolean {
  return path.startsWith('/') ? path.startsWith('/sitecore/content/') : true;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('datasource')?.trim() ?? '';
  const language = searchParams.get('language')?.trim() || 'en';
  const path = toEdgeItemPath(rawPath);

  if (!path || !isAllowedDatasource(path)) {
    return NextResponse.json({ locations: [] }, { status: 400 });
  }

  const locations = await fetchFootprintLocations({ path, language });
  return NextResponse.json({ locations });
}
