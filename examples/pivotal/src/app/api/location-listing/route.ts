import { NextResponse } from 'next/server';

import {
  fetchLocationListingPayload,
  toLocationListingItemPath,
  type LocationListingEdgeMode,
} from '@/lib/location-listing-from-edge';
import { locationListingPublishHint } from '@/lib/location-listing.utils';

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
    return NextResponse.json(
      { locations: [], status: 'invalid-datasource', message: 'Invalid datasource path' },
      { status: 400 }
    );
  }

  try {
    const payload = await fetchLocationListingPayload({
      path,
      language,
      edgeMode,
    });

    if (payload.error && payload.error !== 'edge-empty' && !payload.locations.length) {
      const isQueryFailure = payload.error !== 'Edge children had no hospital-location fields';
      if (isQueryFailure && !payload.itemFound) {
        return NextResponse.json(
          {
            locations: [],
            status: 'error',
            message: payload.error,
            itemFound: payload.itemFound,
            contextsTried: payload.contextsTried,
          },
          { status: 502, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

    return NextResponse.json(
      {
        locations: payload.locations,
        status: payload.locations.length ? 'ok' : 'empty',
        itemFound: payload.itemFound,
        childCount: payload.childCount,
        hospitalCount: payload.hospitalCount,
        contextUsed: payload.contextUsed,
        contextsTried: payload.contextsTried,
        message: payload.locations.length
          ? undefined
          : payload.error === 'edge-empty'
            ? locationListingPublishHint()
            : payload.error,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Location listing Edge request failed';
    console.error('[api/location-listing]', message);
    return NextResponse.json(
      { locations: [], status: 'error', message },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
