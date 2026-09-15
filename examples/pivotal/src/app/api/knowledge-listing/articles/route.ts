import { NextResponse } from 'next/server';

import {
  fetchArticlesByIds,
  fetchRecentlyUpdatedArticles,
  fetchTopRatedArticles,
  type KnowledgeListingEdgeMode,
} from '@/lib/knowledge-listing-from-edge';

/**
 * Dynamic Knowledge Article payload for KnowledgeListing.
 *
 * Query:
 * - mode=recently-updated&maxItems=6&language=en
 * - mode=top-rated&maxItems=6&language=en   (Favorites / community favorites)
 * - mode=by-ids&ids=guid1,guid2&language=en (Recently Viewed)
 * - preview=1  → use SITECORE_EDGE_CONTEXT_ID_PREVIEW (Pages preview / editing)
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get('mode')?.trim().toLowerCase() || 'recently-updated').replace(
    /_/g,
    '-'
  );
  const language = searchParams.get('language')?.trim() || 'en';
  const maxRaw = Number(searchParams.get('maxItems') ?? '6');
  const maxItems = Number.isFinite(maxRaw) ? Math.min(Math.max(Math.floor(maxRaw), 1), 48) : 6;
  const previewParam = (searchParams.get('preview') || '').trim().toLowerCase();
  const edgeMode: KnowledgeListingEdgeMode =
    previewParam === '1' || previewParam === 'true' ? 'preview' : 'live';

  try {
    if (mode === 'by-ids') {
      const ids = (searchParams.get('ids') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, maxItems);
      const articles = await fetchArticlesByIds(ids, language, edgeMode);
      return NextResponse.json({ articles, edgeMode });
    }

    if (mode === 'top-rated' || mode === 'favorites') {
      const articles = await fetchTopRatedArticles(maxItems, language, edgeMode);
      return NextResponse.json({ articles, edgeMode });
    }

    const articles = await fetchRecentlyUpdatedArticles(maxItems, language, edgeMode);
    return NextResponse.json({ articles, edgeMode });
  } catch (error) {
    console.error('[api/knowledge-listing/articles]', error);
    return NextResponse.json({ articles: [], error: 'Failed to load articles' }, { status: 500 });
  }
}
