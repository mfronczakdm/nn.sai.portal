import { NextResponse } from 'next/server';

import {
  assertDownloadListGraphqlQueryOk,
  fetchPlanAssetFileNamesForGraphqlQuery,
} from '@/lib/download-list-bcbs-assets';

type PostBody = { query?: unknown };

/** Proxies plan-asset GraphQL so the token stays on the server. Body: `{ query: string }` from DownloadContent. */
export async function POST(request: Request): Promise<NextResponse> {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ fileNames: [], error: 'invalid_json' }, { status: 400 });
  }

  const query = typeof body.query === 'string' ? body.query : '';
  const bad = assertDownloadListGraphqlQueryOk(query);
  if (bad === 'query_too_large') {
    return NextResponse.json({ fileNames: [], error: bad }, { status: 400 });
  }
  if (bad === 'empty_query' || !query.trim()) {
    return NextResponse.json({ fileNames: [] });
  }

  try {
    const fileNames = await fetchPlanAssetFileNamesForGraphqlQuery(query);
    return NextResponse.json({ fileNames });
  } catch (e) {
    console.error('[api/download-list/plan-assets]', e);
    return NextResponse.json({ fileNames: [], error: 'fetch_failed' }, { status: 502 });
  }
}
