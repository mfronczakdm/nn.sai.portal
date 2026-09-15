import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import type { KnowledgeArticleListItem } from '@/components/knowledge-listing/knowledge-listing.props';
import type { TaxonomyTopicReference } from '@/lib/taxonomy-topic';

/** Knowledge Articles hub under Home */
const DEFAULT_ROOT_PATH = '/sitecore/content/progressive/pkm/Home/Knowledge Articles';
const DEFAULT_ROOT_ID = 'ef281e84-ff74-48c8-b64f-00933f9f0eff';
/** Knowledge Article page template */
const DEFAULT_TEMPLATE_ID = '42f8929a-83cd-48fe-92f0-8aac46e6cc62';

const MAX_FETCH = 48;

export type KnowledgeListingEdgeMode = 'live' | 'preview';

type EdgeJsonField = { jsonValue?: unknown };

type EdgeTopic = { id?: string; name?: string; displayName?: string };

type EdgeArticleNode = {
  id?: string;
  name?: string;
  path?: string;
  url?: { path?: string };
  /** Experience Edge exposes __Updated as a field, not Item.updatedDate */
  updated?: EdgeJsonField;
  title?: EdgeJsonField;
  kbId?: EdgeJsonField;
  purpose?: EdgeJsonField;
  lob?: { targetItems?: EdgeTopic[] };
  perilType?: { targetItems?: EdgeTopic[] };
  averageRating?: EdgeJsonField;
  positiveCount?: EdgeJsonField;
  totalRatings?: EdgeJsonField;
};

type SearchResult = {
  search?: {
    results?: EdgeArticleNode[];
  };
};

type ItemResult = {
  item?: EdgeArticleNode | null;
};

const ARTICLE_FIELDS = `
  id
  name
  path
  url { path }
  updated: field(name: "__Updated") { jsonValue }
  title: field(name: "Title") { jsonValue }
  kbId: field(name: "KB-ID") { jsonValue }
  purpose: field(name: "Purpose") { jsonValue }
  averageRating: field(name: "AverageRating") { jsonValue }
  positiveCount: field(name: "PositiveCount") { jsonValue }
  totalRatings: field(name: "TotalRatings") { jsonValue }
  lob: field(name: "LOB") {
    ... on MultilistField {
      targetItems { id name displayName }
    }
  }
  perilType: field(name: "Peril type") {
    ... on MultilistField {
      targetItems { id name displayName }
    }
  }
`;

/** Edge search keys use lowercase GUID with dashes, no braces. */
function edgeGuid(id: string): string {
  const raw = id.replace(/[{}]/g, '').toLowerCase();
  if (raw.includes('-')) return raw;
  if (raw.length !== 32) return raw;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function stripGuid(id: string): string {
  return id.replace(/[{}]/g, '').toLowerCase();
}

function knowledgeRootId(): string {
  return edgeGuid(process.env.KNOWLEDGE_ARTICLES_ROOT_ID?.trim() || DEFAULT_ROOT_ID);
}

function knowledgeTemplateId(): string {
  return edgeGuid(process.env.KNOWLEDGE_ARTICLE_TEMPLATE_ID?.trim() || DEFAULT_TEMPLATE_ID);
}

/**
 * Resolve Edge context ID for KnowledgeListing fetches.
 * Prefer dedicated LIVE / PREVIEW vars when set; fall back to the app default.
 */
export function resolveKnowledgeListingContextId(mode: KnowledgeListingEdgeMode): string {
  const fallback =
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    '';

  if (mode === 'preview') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_PREVIEW?.trim() || fallback;
  }

  return process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() || fallback;
}

function createEdgeClient(mode: KnowledgeListingEdgeMode): SitecoreClient {
  const contextId = resolveKnowledgeListingContextId(mode);
  return new SitecoreClient({
    ...scConfig,
    api: {
      ...scConfig.api,
      edge: {
        ...scConfig.api.edge,
        contextId,
        clientContextId: contextId,
      },
    },
  });
}

function readNumber(field?: EdgeJsonField): number {
  if (!field || field.jsonValue == null) return 0;
  const jv = field.jsonValue;
  if (typeof jv === 'number' && Number.isFinite(jv)) return jv;
  if (typeof jv === 'string') {
    const n = Number(jv);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof jv === 'object' && jv !== null && 'value' in jv) {
    const v = (jv as { value?: unknown }).value;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return 0;
}

function readString(field?: EdgeJsonField): string {
  if (!field || field.jsonValue == null) return '';
  const jv = field.jsonValue;
  if (typeof jv === 'string') return jv.trim();
  if (typeof jv === 'object' && jv !== null && 'value' in jv) {
    const v = (jv as { value?: unknown }).value;
    if (typeof v === 'string') return v.trim();
  }
  return '';
}

function mapTopics(topics?: EdgeTopic[]): TaxonomyTopicReference[] | undefined {
  if (!topics?.length) return undefined;
  return topics
    .filter((t): t is EdgeTopic & { id: string; name: string } => Boolean(t.id && t.name))
    .map((t) => ({
      id: t.id,
      name: t.name,
      displayName: t.displayName || t.name,
    }));
}

function mapNode(node: EdgeArticleNode | null | undefined): KnowledgeArticleListItem | null {
  if (!node?.id) return null;
  const lobItems = mapTopics(node.lob?.targetItems);
  const perilItems = mapTopics(node.perilType?.targetItems);
  return {
    id: node.id,
    name: node.name || '',
    path: node.path,
    url: node.url,
    updatedDate: readString(node.updated) || undefined,
    title: node.title as KnowledgeArticleListItem['title'],
    kbId: node.kbId as KnowledgeArticleListItem['kbId'],
    purpose: node.purpose as KnowledgeArticleListItem['purpose'],
    lob: lobItems ? { targetItems: lobItems } : undefined,
    perilType: perilItems ? { targetItems: perilItems } : undefined,
    averageRating: readNumber(node.averageRating),
    positiveCount: readNumber(node.positiveCount),
    totalRatings: readNumber(node.totalRatings),
  };
}

function buildSearchQuery(): string {
  return `
    query KnowledgeListingSearch($rootId: String!, $templateId: String!, $first: Int!) {
      search(
        where: {
          AND: [
            { name: "_path", value: $rootId, operator: CONTAINS }
            { name: "_templates", value: $templateId, operator: EQ }
          ]
        }
        first: $first
      ) {
        results {
          ${ARTICLE_FIELDS}
        }
      }
    }
  `;
}

function buildItemQuery(): string {
  return `
    query KnowledgeListingItem($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        ${ARTICLE_FIELDS}
      }
    }
  `;
}

export type KnowledgeListingFetchOptions = {
  language?: string;
  /** Use preview Edge context (Pages preview / editing host) */
  edgeMode?: KnowledgeListingEdgeMode;
};

/** Pull the Knowledge Article pool from Edge (under Home/Knowledge Articles). */
export async function fetchKnowledgeArticlePool(
  language = 'en',
  first = MAX_FETCH,
  edgeMode: KnowledgeListingEdgeMode = 'live'
): Promise<KnowledgeArticleListItem[]> {
  const client = createEdgeClient(edgeMode);
  try {
    const data = await client.getData<SearchResult>(buildSearchQuery(), {
      rootId: knowledgeRootId(),
      templateId: knowledgeTemplateId(),
      first: Math.min(MAX_FETCH, Math.max(first, 1)),
      language,
    });
    return (data?.search?.results ?? [])
      .map(mapNode)
      .filter((a): a is KnowledgeArticleListItem => Boolean(a));
  } catch (error) {
    console.error(
      `[fetchKnowledgeArticlePool] Edge search failed (mode=${edgeMode}):`,
      error
    );
    return [];
  }
}

export function sortByUpdatedDesc(articles: KnowledgeArticleListItem[]): KnowledgeArticleListItem[] {
  return [...articles].sort((a, b) => {
    const ta = a.updatedDate ? Date.parse(a.updatedDate) : 0;
    const tb = b.updatedDate ? Date.parse(b.updatedDate) : 0;
    return tb - ta;
  });
}

/**
 * Community favorites: highest AverageRating, then PositiveCount, then TotalRatings.
 * Articles with no ratings sink to the bottom.
 */
export function sortByTopRated(articles: KnowledgeArticleListItem[]): KnowledgeArticleListItem[] {
  return [...articles].sort((a, b) => {
    const ar = a.averageRating ?? 0;
    const br = b.averageRating ?? 0;
    if (br !== ar) return br - ar;
    const ap = a.positiveCount ?? 0;
    const bp = b.positiveCount ?? 0;
    if (bp !== ap) return bp - ap;
    return (b.totalRatings ?? 0) - (a.totalRatings ?? 0);
  });
}

/** Fetch Knowledge Articles under the hub, newest first. */
export async function fetchRecentlyUpdatedArticles(
  maxItems: number,
  language = 'en',
  edgeMode: KnowledgeListingEdgeMode = 'live'
): Promise<KnowledgeArticleListItem[]> {
  const first = Math.min(Math.max(maxItems, 1), MAX_FETCH);
  const pool = await fetchKnowledgeArticlePool(language, MAX_FETCH, edgeMode);
  return sortByUpdatedDesc(pool).slice(0, first);
}

/** Fetch top-rated Knowledge Articles (Favorites mode). */
export async function fetchTopRatedArticles(
  maxItems: number,
  language = 'en',
  edgeMode: KnowledgeListingEdgeMode = 'live'
): Promise<KnowledgeArticleListItem[]> {
  const first = Math.min(Math.max(maxItems, 1), MAX_FETCH);
  const pool = await fetchKnowledgeArticlePool(language, MAX_FETCH, edgeMode);
  return sortByTopRated(pool).slice(0, first);
}

/** Fetch specific Knowledge Articles by item ID (preserves input order). */
export async function fetchArticlesByIds(
  ids: string[],
  language = 'en',
  edgeMode: KnowledgeListingEdgeMode = 'live'
): Promise<KnowledgeArticleListItem[]> {
  if (!ids.length) return [];

  const client = createEdgeClient(edgeMode);
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  const results = await Promise.all(
    unique.map(async (id) => {
      try {
        const data = await client.getData<ItemResult>(buildItemQuery(), {
          path: id.startsWith('{') ? id : `{${id}}`,
          language,
        });
        return mapNode(data?.item);
      } catch (error) {
        console.error(`[fetchArticlesByIds] failed for ${id} (mode=${edgeMode}):`, error);
        return null;
      }
    })
  );

  const byId = new Map(
    results
      .filter((a): a is KnowledgeArticleListItem => Boolean(a))
      .map((a) => [stripGuid(a.id), a])
  );

  const ordered: KnowledgeArticleListItem[] = [];
  for (const id of ids) {
    const hit = byId.get(stripGuid(id));
    if (hit) ordered.push(hit);
  }
  return ordered;
}

export function resolveKnowledgeArticlesRootPath(): string {
  return process.env.KNOWLEDGE_ARTICLES_ROOT_PATH?.trim() || DEFAULT_ROOT_PATH;
}
