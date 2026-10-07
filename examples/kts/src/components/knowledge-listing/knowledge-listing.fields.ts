import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { TaxonomyTopicReference } from '@/lib/taxonomy-topic';
import { getRecentlyViewedArticleIds } from '@/lib/knowledge-preferences';

import type {
  KnowledgeArticleListItem,
  KnowledgeListingDatasource,
  KnowledgeListingMode,
  KnowledgeListingProps,
} from './knowledge-listing.props';

export type ResolvedKnowledgeArticle = {
  id: string;
  name: string;
  href: string;
  updatedDate?: string;
  title: string;
  kbId: string;
  purposeHtml: string;
  purposePlain: string;
  lob: TaxonomyTopicReference[];
  perilTypes: TaxonomyTopicReference[];
  averageRating?: number;
  positiveCount?: number;
};

function unwrapField<T>(cell: T | { jsonValue?: T } | undefined): T | undefined {
  if (!cell) return undefined;
  if (typeof cell === 'object' && cell !== null && 'jsonValue' in cell && cell.jsonValue !== undefined) {
    return cell.jsonValue;
  }
  return cell as T;
}

function textValue(field?: Field<string> | { jsonValue?: Field<string> }): string {
  const f = unwrapField(field as Field<string> | { jsonValue?: Field<string> });
  return f?.value?.trim() || '';
}

function richTextValue(field?: RichTextField | { jsonValue?: RichTextField }): string {
  const f = unwrapField(field as RichTextField | { jsonValue?: RichTextField });
  return typeof f?.value === 'string' ? f.value : '';
}

function plainFromHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function articleHref(item: KnowledgeArticleListItem): string {
  if (typeof item.url === 'string' && item.url) return item.url;
  if (item.url && typeof item.url === 'object' && item.url.path) return item.url.path;
  if (item.path) {
    const marker = '/Home';
    const idx = item.path.indexOf(marker);
    if (idx >= 0) {
      const rest = item.path.slice(idx + marker.length);
      return rest.startsWith('/') ? rest : `/${rest}`;
    }
  }
  return '#';
}

function normalizeId(id: string): string {
  return id.replace(/[{}]/g, '').toLowerCase();
}

function topicsFromGraph(item: KnowledgeArticleListItem, key: 'lob' | 'perilType'): TaxonomyTopicReference[] {
  const graph = item[key]?.targetItems;
  if (Array.isArray(graph) && graph.length) {
    return graph.map((t) => ({
      id: t.id,
      name: t.name,
      displayName: t.displayName || t.name,
    }));
  }
  const layoutKey = key === 'lob' ? 'LOB' : 'Peril type';
  const layout = item.fields?.[layoutKey];
  return Array.isArray(layout) ? layout : [];
}

export function resolveDatasource(
  props: KnowledgeListingProps
): KnowledgeListingDatasource | null {
  return props.fields?.data?.datasource || (props.fields as KnowledgeListingDatasource | undefined) || null;
}

export function mapArticle(item: KnowledgeArticleListItem): ResolvedKnowledgeArticle {
  const title =
    textValue(item.title) ||
    textValue(item.fields?.Title) ||
    item.name ||
    'Knowledge Article';
  const kbId = textValue(item.kbId) || textValue(item.fields?.['KB-ID']);
  const purposeHtml = richTextValue(item.purpose) || richTextValue(item.fields?.Purpose);
  return {
    id: item.id,
    name: item.name,
    href: articleHref(item),
    updatedDate: item.updatedDate,
    title,
    kbId,
    purposeHtml,
    purposePlain: plainFromHtml(purposeHtml),
    lob: topicsFromGraph(item, 'lob'),
    perilTypes: topicsFromGraph(item, 'perilType'),
    averageRating: item.averageRating,
    positiveCount: item.positiveCount,
  };
}

export function resolveMaxItems(datasource: KnowledgeListingDatasource | null): number {
  const field =
    unwrapField(datasource?.maxItems) ||
    unwrapField(datasource?.MaxItems as Field<string | number> | { jsonValue?: Field<string | number> });
  const raw = field?.value;
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').trim());
  if (!Number.isFinite(n) || n < 1) return 6;
  return Math.min(Math.floor(n), 48);
}

export function resolveListingMode(datasource: KnowledgeListingDatasource | null): KnowledgeListingMode {
  const field =
    unwrapField(datasource?.listingMode) ||
    unwrapField(datasource?.ListingMode as Field<string> | { jsonValue?: Field<string> });
  const raw = (field?.value || 'Recently Updated').trim().toLowerCase();
  if (raw.includes('favor') || raw.includes('rated') || raw.includes('top')) return 'Favorites';
  if (raw.includes('view')) return 'Recently Viewed';
  return 'Recently Updated';
}

export function resolveTitle(datasource: KnowledgeListingDatasource | null): Field<string> | undefined {
  return unwrapField(datasource?.title) || unwrapField(datasource?.Title as Field<string> | { jsonValue?: Field<string> });
}

export function resolveDescription(
  datasource: KnowledgeListingDatasource | null
): Field<string> | undefined {
  return (
    unwrapField(datasource?.description) ||
    unwrapField(datasource?.Description as Field<string> | { jsonValue?: Field<string> })
  );
}

/**
 * Load articles dynamically from Edge based on Listing Mode:
 * - Recently Updated → newest under Knowledge Articles
 * - Favorites → highest AverageRating / PositiveCount
 * - Recently Viewed → visitor history (localStorage) by item ID
 *
 * Pass `preview: true` in Pages preview / editing so the API uses
 * SITECORE_EDGE_CONTEXT_ID_PREVIEW instead of the live context.
 */
export async function fetchListingArticles(args: {
  mode: KnowledgeListingMode;
  maxItems: number;
  language?: string;
  preview?: boolean;
}): Promise<ResolvedKnowledgeArticle[]> {
  const language = args.language || 'en';
  const { mode, maxItems, preview } = args;

  if (mode === 'Recently Viewed') {
    const ids = getRecentlyViewedArticleIds().slice(0, maxItems);
    if (!ids.length) return [];
    const qs = new URLSearchParams({
      mode: 'by-ids',
      ids: ids.join(','),
      maxItems: String(maxItems),
      language,
    });
    if (preview) qs.set('preview', '1');
    const res = await fetch(`/api/knowledge-listing/articles?${qs.toString()}`);
    if (!res.ok) return [];
    const body = (await res.json()) as { articles?: KnowledgeArticleListItem[] };
    const mapped = (body.articles ?? []).map(mapArticle);
    const byId = new Map(mapped.map((a) => [normalizeId(a.id), a]));
    const ordered: ResolvedKnowledgeArticle[] = [];
    for (const id of ids) {
      const hit = byId.get(normalizeId(id));
      if (hit) ordered.push(hit);
    }
    return ordered;
  }

  const apiMode = mode === 'Favorites' ? 'top-rated' : 'recently-updated';
  const qs = new URLSearchParams({
    mode: apiMode,
    maxItems: String(maxItems),
    language,
  });
  if (preview) qs.set('preview', '1');
  const res = await fetch(`/api/knowledge-listing/articles?${qs.toString()}`);
  if (!res.ok) return [];
  const body = (await res.json()) as { articles?: KnowledgeArticleListItem[] };
  return (body.articles ?? []).map(mapArticle);
}
