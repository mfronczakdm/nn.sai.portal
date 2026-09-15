import { NextResponse } from 'next/server';

import {
  fetchPhysicianListingPayload,
  toPhysicianListingItemPath,
  type PhysicianListingEdgeMode,
} from '@/lib/physician-listing-from-edge';

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
  const edgeMode: PhysicianListingEdgeMode =
    previewParam === '1' || previewParam === 'true' ? 'preview' : 'live';
  const path = toPhysicianListingItemPath(rawDatasource);

  if (!path || !isAllowedPath(path)) {
    return NextResponse.json({ physicians: [], locations: [] }, { status: 400 });
  }

  try {
    const { physicians, locations } = await fetchPhysicianListingPayload({
      path,
      language,
      edgeMode,
    });
    return NextResponse.json({ physicians, locations }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Physician listing Edge request failed';
    console.error('[api/physician-listing]', message);
    return NextResponse.json(
      { physicians: [], locations: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
