import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  assertDownloadListGraphqlQueryOk,
  fetchPlanAssetFileNamesForGraphqlQuery,
} from '@/lib/download-list-bcbs-assets';
import {
  DOWNLOAD_LIST_TAXONOMY_VARIABLE,
  downloadListQueryUsesTaxonomyVariable,
} from '@/lib/download-list-graphql-session';

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

  const needsTaxonomy = downloadListQueryUsesTaxonomyVariable(query);
  let variables: Record<string, string> | undefined;
  if (needsTaxonomy) {
    const session = await auth();
    const taxonomy = session?.user?.taxonomy?.trim();
    if (!taxonomy) {
      return NextResponse.json({ fileNames: [], error: 'missing_taxonomy' });
    }
    variables = { [DOWNLOAD_LIST_TAXONOMY_VARIABLE]: taxonomy };
  }

  try {
    const fileNames = await fetchPlanAssetFileNamesForGraphqlQuery(query, variables);
    return NextResponse.json({ fileNames });
  } catch (e) {
    console.error('[api/download-list/plan-assets]', e);
    return NextResponse.json({ fileNames: [], error: 'fetch_failed' }, { status: 502 });
  }
}
